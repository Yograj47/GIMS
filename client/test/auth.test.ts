import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userService } from "../src/features/auth/api/user.service";
import { useAuthStore } from "../src/store/authStore";
import { socket } from "../src/features/socket/socket";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useUsers } from "../src/features/auth/hooks/useUsers";
import { clearPasswordReset, readPasswordReset, savePasswordReset } from "../src/features/auth/passwordReset";
import api from "../src/lib/api";
import type { UserData } from "../src/types/user";

vi.mock("../src/features/socket/socket", () => ({ socket: { connected: false, connect: vi.fn(), disconnect: vi.fn() } }));
const user: UserData = { _id: "000000000000000000000001", name: "Customer", email: "customer@example.test", role: "customer", isVerified: true };

beforeEach(() => { vi.restoreAllMocks(); localStorage.clear(); sessionStorage.clear(); useAuthStore.getState().reset(); });
afterEach(cleanup);

describe("account sessions", () => {
    it("emits a session expiry event after a protected request returns 401", async () => {
        const expired = vi.fn();
        window.addEventListener("session:expired", expired);
        try {
            await expect(api.get("/checkout/customer/orders", {
                adapter: async (config) => { throw { config, response: { status: 401, data: { message: "Session expired" } } }; },
            })).rejects.toBeDefined();
            expect(expired).toHaveBeenCalledTimes(1);
        } finally { window.removeEventListener("session:expired", expired); }
    });
    it("normalizes the server account id for frontend ownership checks", async () => {
        vi.spyOn(api, "get").mockResolvedValue({ data: { success: true, data: { ...user, _id: undefined, id: user._id } } });
        expect((await userService.getMe()).data?._id).toBe(user._id);
    });
    it("deduplicates startup requests and connects verified sessions", async () => {
        const getMe = vi.spyOn(userService, "getMe").mockResolvedValue({ success: true, data: user });
        await Promise.all([useAuthStore.getState().fetchUser(), useAuthStore.getState().fetchUser()]);
        expect(getMe).toHaveBeenCalledTimes(1);
        expect(useAuthStore.getState().user?._id).toBe(user._id);
        expect(socket.connect).toHaveBeenCalled();
        expect(localStorage.getItem("auth-storage")).toBeNull();
    });
    it("does not resurrect a session when an old request finishes after sign-out", async () => {
        let complete!: (value: Awaited<ReturnType<typeof userService.getMe>>) => void;
        vi.spyOn(userService, "getMe").mockImplementation(() => new Promise((resolve) => { complete = resolve; }));
        const pending = useAuthStore.getState().fetchUser();
        useAuthStore.getState().reset();
        complete({ success: true, data: user });
        expect(await pending).toBe(false);
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
    it("does not connect notifications before verification", async () => {
        vi.spyOn(userService, "getMe").mockResolvedValue({ success: true, data: { ...user, isVerified: false } });
        const connectCount = vi.mocked(socket.connect).mock.calls.length;
        await useAuthStore.getState().fetchUser();
        expect(vi.mocked(socket.connect).mock.calls.length).toBe(connectCount);
    });
    it("refreshes the authenticated session after a password change", async () => {
        vi.spyOn(userService, "updatePassword").mockResolvedValue({ success: true });
        vi.spyOn(userService, "getMe").mockResolvedValue({ success: true, data: user });
        const { result } = renderHook(() => useUsers());
        const connectCount = vi.mocked(socket.connect).mock.calls.length;
        await act(async () => { await result.current.updatePassword("old-password", "new-password"); });
        expect(vi.mocked(socket.connect).mock.calls.length).toBe(connectCount + 1);
    });
});

describe("password reset state", () => {
    it("separates customer and workspace resets", () => {
        savePasswordReset(true, "customer@example.test");
        expect(readPasswordReset(true)?.email).toBe("customer@example.test");
        expect(readPasswordReset(false)).toBeNull();
        clearPasswordReset(true);
        expect(readPasswordReset(true)).toBeNull();
    });
    it("discards expired reset state", () => {
        vi.useFakeTimers();
        try {
            savePasswordReset(false, "staff@example.test");
            vi.advanceTimersByTime(601_000);
            expect(readPasswordReset(false)).toBeNull();
        } finally { vi.useRealTimers(); }
    });
});

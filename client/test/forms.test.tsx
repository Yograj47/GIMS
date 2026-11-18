import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import RegisterForm from "../src/features/auth/components/RegisterForm";
import PageErrorBoundary from "../src/components/common/PageErrorBoundary";

const mocks = vi.hoisted(() => ({ register: vi.fn() }));
vi.mock("../src/features/auth/hooks/useAuth", () => ({ useAuth: () => ({ register: mocks.register, isLoading: false }) }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); mocks.register.mockReset(); });

describe("registration", () => {
    it("has accessible labels and keeps the form usable when registration fails", async () => {
        mocks.register.mockRejectedValue(new Error("Mobile already registered"));
        const user = userEvent.setup();
        render(<MemoryRouter><RegisterForm /></MemoryRouter>);
        await user.type(screen.getByLabelText("Full Name"), "Test Shopper");
        await user.type(screen.getByLabelText("Email Address"), "shopper@example.test");
        await user.type(screen.getByLabelText("Mobile number"), "9841234567");
        await user.type(screen.getByLabelText("Password", { exact: true }), "test-password");
        await user.type(screen.getByLabelText("Confirm password"), "test-password");
        await user.click(screen.getByRole("button", { name: "Show passwords" }));
        expect(screen.getByLabelText("Password", { exact: true }).getAttribute("type")).toBe("text");
        await user.click(screen.getByRole("button", { name: "Create Account" }));
        expect(mocks.register).toHaveBeenCalledTimes(1);
        expect(screen.getByRole("button", { name: "Create Account" })).toBeTruthy();
    });
    it("blocks submission when the mobile number is invalid", async () => {
        render(<MemoryRouter><RegisterForm /></MemoryRouter>);
        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: "Create Account" }));
        expect(mocks.register).not.toHaveBeenCalled();
        expect(await screen.findByText("Enter a valid mobile number")).toBeTruthy();
    });
});

it("offers recovery when a route fails to render", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    function BrokenPage(): never { throw new Error("Chunk failed to load"); }
    render(<PageErrorBoundary><BrokenPage /></PageErrorBoundary>);
    expect(screen.getByRole("alert").textContent).toContain("This page couldn’t load");
    expect(screen.getByRole("button", { name: "Reload page" })).toBeTruthy();
});

import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { ProtectedRoute } from "../src/features/auth/components/ProtectedRoute";
import { useAuthStore } from "../src/store/authStore";

vi.mock("../src/features/socket/socket", () => ({ socket: { connected: false, connect: vi.fn(), disconnect: vi.fn() } }));
afterEach(() => { cleanup(); useAuthStore.getState().reset(); });

function LoginDestination() {
    const location = useLocation();
    return <p>Sign in to continue to {location.state?.from?.pathname}</p>;
}

it("redirects an expired customer session to sign-in and preserves the requested page", async () => {
    useAuthStore.getState().reset();
    useAuthStore.getState().setUser({ _id: "000000000000000000000001", name: "Customer", email: "customer@example.test", role: "customer", isVerified: true });
    render(<MemoryRouter initialEntries={["/shop/cart"]}><Routes>
        <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
            <Route path="/shop/cart" element={<p>Your cart</p>} />
        </Route>
        <Route path="/shop/login" element={<LoginDestination />} />
    </Routes></MemoryRouter>);
    expect(screen.getByText("Your cart")).toBeTruthy();
    act(() => useAuthStore.getState().reset());
    expect(await screen.findByText("Sign in to continue to /shop/cart")).toBeTruthy();
});

import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";

import { Loading } from "@/lib/loader";

export const PublicRoute = () => {
    const {
        isAuthenticated,
        isInitialLoading,
    } = useAuthStore();

    if (isInitialLoading) {
        return <Loading fullPage />;
    }

    if (isAuthenticated) {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    return <Outlet />;
};
import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";

import { AuthSkeleton } from "@/components/common/LoadingSkeleton";

export const PublicRoute = () => {
    const {
        isAuthenticated,
        isInitialLoading,
        user,
    } = useAuthStore();

    if (isInitialLoading) {
        return <AuthSkeleton label="Checking your session" />;
    }

    if (isAuthenticated) {
        return (
            <Navigate
                to={user?.role === "customer" ? "/shop" : "/dashboard"}
                replace
            />
        );
    }

    return <Outlet />;
};

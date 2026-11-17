import { workspaceHome } from "@/shared/constants/roles";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";

import { AuthSkeleton } from "@/components/common/LoadingSkeleton";
import { ShopPageSkeleton } from "@/features/checkout/ShopLoading";

export const PublicRoute = () => {
    const {
        isAuthenticated,
        isInitialLoading,
        user,
    } = useAuthStore();

    const location = useLocation();
    const from = location.state?.from;
    const returnToShopPage = location.pathname === "/shop/login" &&
        typeof from?.pathname === "string" &&
        /^\/shop\/(cart|checkout|profile|orders(?:\/[a-f0-9]{24})?|products\/[a-f0-9]{24})\/?$/i.test(from.pathname);

    if (isInitialLoading) {
        return location.pathname.startsWith("/shop/") ? <ShopPageSkeleton /> : <AuthSkeleton label="Checking your session" />;
    }

    if (isAuthenticated) {
        const verifiedDestination = user?.role === "customer" && returnToShopPage
            ? { pathname: from.pathname, search: from.search }
            : workspaceHome(user?.role);
        return (
            <Navigate
                to={user && !user.isVerified ? (user.role === "customer" ? "/shop/verify" : "/verify") : verifiedDestination}
                replace
            />
        );
    }

    return <Outlet />;
};

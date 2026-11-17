import { Navigate, Outlet, useLocation, useOutletContext } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";

import { StartupSkeleton } from "@/components/common/LoadingSkeleton";
import { ShopPageSkeleton } from "@/features/checkout/ShopLoading";
import type { UserRole } from "@/types/user";


interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  requireVerified?: boolean;
}

export const ProtectedRoute = ({
  allowedRoles,
  requireVerified = true,
}: ProtectedRouteProps) => {
  const {
    user,
    isAuthenticated,
    isInitialLoading,
  } = useAuthStore();

  const location = useLocation();
  const outletContext = useOutletContext();


  if (isInitialLoading) {
    return location.pathname.startsWith("/shop/") ? <ShopPageSkeleton /> : <StartupSkeleton label="Checking your session" />;
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={location.pathname.startsWith("/shop/") ? "/shop/login" : "/login"}
        state={{ from: location }}
        replace
      />
    );
  }

  if (
    requireVerified &&
    !user.isVerified
  ) {
    return (
      <Navigate
        to={user.role === "customer" ? "/shop/verify" : "/verify"}
        replace
      />
    );
  }

  if (requireVerified && user.role === "customer" && !allowedRoles?.includes("customer")) return <Navigate to="/shop" replace />;

  if (
    allowedRoles &&
    !allowedRoles.includes(
      user.role
    )
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return <Outlet context={outletContext} />;
};

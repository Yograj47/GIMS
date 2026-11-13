import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";

import { StartupSkeleton } from "@/components/common/LoadingSkeleton";
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


  if (isInitialLoading) {
    return <StartupSkeleton label="Checking your session" />;
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
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
        to="/verify"
        replace
      />
    );
  }

  if (user.role === "customer") return <Navigate to="/shop" replace />;

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

  return <Outlet />;
};

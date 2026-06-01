import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuth";
import { Loading } from "@/lib/loader";

interface ProtectedRouteProps {
  allowedRoles?: ("admin" | "owner" | "staff")[];
  requireVerified?: boolean;
}

export const ProtectedRoute = ({
  allowedRoles,
  requireVerified = true
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isInitialLoading } = useAuthStore();
  const location = useLocation();

  if (isInitialLoading) {
    return <Loading fullPage />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireVerified && user && !user.isVerified) {
    return <Navigate to="/verify" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
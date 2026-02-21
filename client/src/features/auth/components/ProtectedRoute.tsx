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

  // 1. Handle Initial Loading (Prevent flickering)
  if (isInitialLoading) {
    return <Loading fullPage />
  }

  // 2. Not Authenticated -> Redirect to Login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Authenticated but Not Verified -> Redirect to Verify Page
  // (Using "isVerified" to match your backend typo)
  if (requireVerified && user && !user.isVerified) {
    return <Navigate to="/verify" replace />;
  }

  // 4. Role Authorization Check
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 5. Success -> Render the child routes
  return <Outlet />;
};
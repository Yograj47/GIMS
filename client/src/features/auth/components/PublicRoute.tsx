import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuth";
import { Loading } from "@/lib/loader";

export const PublicRoute = () => {
    const { isAuthenticated, isInitialLoading } = useAuthStore();

    if (isInitialLoading) {
        return <Loading fullPage />;
    }
    // If already logged in, don't let them see Login/Register/Home
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }
    
    // If not logged in, let them proceed to the guest page
    return <Outlet />;
};
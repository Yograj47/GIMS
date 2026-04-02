import { useAuthStore } from "@/store/useAuth";
import type { ReactNode } from "react";

interface AdminGateProps {
    children: ReactNode;
    fallback?: ReactNode;
    allowedRoles?: string[]; 
}

export const AdminGate = ({ children, fallback = null, allowedRoles = [] }: AdminGateProps) => {
    const { user } = useAuthStore();

    if (!user) return <>{fallback}</>;

    const userRole = user?.role.toLowerCase();
    const isAdmin = userRole === "admin";

    const hasExtraAccess = allowedRoles
        .map(role => role.toLowerCase())
        .includes(userRole || "");

    if (!isAdmin && !hasExtraAccess) {
        return <>{fallback}</>;
    }
    
    if (isAdmin || hasExtraAccess) {
        return <>{children}</>;
    }

    return <>{children}</>;
};
import { useAuthStore } from "@/store/useAuth";
import type { ReactNode } from "react";

interface AdminGateProps {
    children: ReactNode;
    fallback?: ReactNode;
}

export const AdminGate = ({ children, fallback = null }: AdminGateProps) => {
    const { user } = useAuthStore();
    const isAdmin = user?.role.toLowerCase() === "admin";

    if (!isAdmin) return <>{fallback}</>;
    return <>{children}</>;
};
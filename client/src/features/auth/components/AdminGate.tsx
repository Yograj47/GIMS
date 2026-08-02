import type { ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types/user";

interface AdminGateProps {
    children: ReactNode;
    fallback?: ReactNode;
    allowedRoles?: UserRole[];
}

export const AdminGate = ({
    children,
    fallback = null,
    allowedRoles = [],
}: AdminGateProps) => {
    const { user } = useAuthStore();

    if (!user) {
        return <>{fallback}</>;
    }

    const hasAccess =
        user.role === "admin" ||
        allowedRoles.includes(user.role);

    return hasAccess
        ? <>{children}</>
        : <>{fallback}</>;
};
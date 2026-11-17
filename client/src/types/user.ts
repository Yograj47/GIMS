import type { Role } from "@/shared/constants/roles";

export interface UserData {
    _id: string;
    name: string;
    email: string;
    role: Role;
    isVerified: boolean;
    phone?: string | null;
    deliveryAddress?: { province: string; district: string; address: string } | null;
}

export type UserRole = Role;

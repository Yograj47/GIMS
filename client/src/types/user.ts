import type { Role } from "@/shared/constants/roles";

export interface UserData {
    _id: string;
    name: string;
    email: string;
    role: Role;
    isVerified: boolean;
}

export type UserRole =
    | "admin"
    | "owner"
    | "staff";
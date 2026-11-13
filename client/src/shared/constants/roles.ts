export const ROLES = {
    ADMIN: "admin",
    OWNER: "owner",
    STAFF: "staff",
    CUSTOMER: "customer",
} as const;

export type Role =
    (typeof ROLES)[keyof typeof ROLES];

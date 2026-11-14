export const ROLES = {
    ADMIN: "admin",
    OWNER: "owner",
    STAFF: "staff",
    ACCOUNTANT: "accountant",
    CUSTOMER: "customer",
} as const;

export type Role =
    (typeof ROLES)[keyof typeof ROLES];

export function workspaceHome(role?: Role) {
    switch (role) {
        case ROLES.CUSTOMER: return "/shop";
        case ROLES.STAFF: return "/staff";
        case ROLES.ACCOUNTANT: return "/accounting";
        default: return "/dashboard";
    }
}

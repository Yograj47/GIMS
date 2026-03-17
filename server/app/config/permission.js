const ROLES = {
    // Admin is handled as a special case ("all") 
    admin: "all",

    owner: [
        'dashboard:read',
        'alert:read',
        "alert:write",
        'report:read',
        // Products: Full access (All)
        "transaction:read",
        'product:read',
        'product:write',
        'product:delete',
        // Suppliers: Full access (All)
        'supplier:read',
        'supplier:write',
        'supplier:delete',
        'transaction:audit',
        // Settings: General (All), Others (Read-only)
        'generalSetting:read',
        'generalSetting:write',
        'category:read',    // Read-only (no write)
        'unit:read',        // Read-only (no write)
        'productUnit:read', // Read-only (no write)
        // Stock Movement: NO access (Removed transaction)
        // User Management: NO access (Removed user:read)
    ],

    staff: [
        'dashboard:read',
        'alert:read',
        "alert:write",
        // Stock Movement: Full access
        'transaction:read',
        'transaction:write', 
        // Products & Suppliers: View Only
        'product:read',
        'supplier:read',
        'generalSetting:read',
    ],
};

export default ROLES;
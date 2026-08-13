export const API_VERSION = "v1";

export const API = `/api/${API_VERSION}`;

export const ROUTES = {
    AUTH: "/auth",
    USERS: "/users",

    INVENTORY: {
        CATEGORIES: "/categories",
        UNITS: "/units",
        PRODUCTS: "/products",
        PRODUCT_UNITS: "/product-units",
        SUPPLIERS: "/suppliers",
    },

    TRANSACTIONS: "/transactions",
    MOVEMENTS: "/movements",

    ACTIVITY_LOGS: "/activity-logs",

    ALERTS: "/alerts",

    SETTINGS: "/settings",

    ANALYTICS: "/analytics",
};
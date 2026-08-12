export const SOCKET_EVENTS = {
    USER_ONLINE: "user:online",
    USER_OFFLINE: "user:offline",

    NOTIFICATION: "notification:new",

    INVENTORY_UPDATED: "inventory:updated",
    STOCK_MOVEMENT_CREATED:
        "stock-movement:created",

    ALERT_CREATED:
        "alert:created",

    ALERT_UPDATED:
        "alert:updated",

    ALERT_RESOLVED:
        "alert:resolved",

    ALERT_ACKNOWLEDGED:
        "alert:acknowledged",
} as const;
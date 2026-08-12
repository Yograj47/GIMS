export const SOCKET_EVENTS = {
    // Socket lifecycle
    CONNECTION: "connection",
    DISCONNECT: "disconnect",

    // Presence
    USER_ONLINE: "user:online",
    USER_OFFLINE: "user:offline",

    // Notifications
    NOTIFICATION: "notification:new",

    // Inventory
    INVENTORY_UPDATED: "inventory:updated",
    STOCK_MOVEMENT_CREATED: "stock-movement:created",

    // Alerts
    ALERT_CREATED: "alert:created",
    ALERT_UPDATED: "alert:updated",
    ALERT_RESOLVED: "alert:resolved",
    ALERT_ACKNOWLEDGED: "alert:acknowledged",
};
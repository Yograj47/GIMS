import { emitToRoom } from "../../shared/socket/emitter.js";
import { SOCKET_EVENTS } from "../../shared/socket/socketEvents.js";
import { activeOrderStages, orderStage } from "./orderLifecycle.js";

export function notifyOrderUpdate(order, event) {
    if (order.channel !== "online" || !event) return;
    const payload = { orderId: order.id, status: event.status };
    const rooms = ["role:owner", "role:admin"];
    if (activeOrderStages.includes(orderStage(order)) || order.timeline.some(({ status }) => status === "approved")) {
        rooms.push("role:staff");
    }
    if (order.customerId) rooms.push(`customer:${order.customerId}`);
    for (const room of rooms) {
        try { emitToRoom(room, SOCKET_EVENTS.ORDER_UPDATED, payload); }
        catch { /* The order timeline is available even when the socket server is offline. */ }
    }
}

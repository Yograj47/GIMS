export const orderStages = [
    "awaiting_review", "needs_confirmation", "approved", "packing", "packed",
    "ready_for_pickup", "out_for_delivery", "picked_up", "delivered", "cancelled",
];

export const activeOrderStages = ["approved", "packing", "packed", "ready_for_pickup", "out_for_delivery"];

export function orderStage(order) {
    if (order.channel !== "online") return undefined;
    if (order.status === "cancelled") return "cancelled";
    if (order.status === "completed") return order.fulfillment === "pickup" ? "picked_up" : "delivered";
    return order.fulfillmentStatus ?? "awaiting_review";
}

export function addOrderEvent(order, status, { actorId, actorType, note } = {}) {
    order.timeline.push({ status, actorId, actorType, note, at: new Date() });
}

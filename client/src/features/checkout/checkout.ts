import api from "@/lib/api";

export type Order = {
    id: string;
    status: "reserved" | "expired" | "paid" | "completed" | "cancelled" | "payment_review";
    channel: "in_store" | "online";
    fulfillment: "counter" | "pickup" | "delivery";
    paymentMethod: "cash" | "gateway";
    totalMinor: number;
    expiresAt?: string;
    createdAt?: string;
    paymentUrl?: string;
    transactionId?: string;
    paymentInitiated?: boolean;
    fulfillmentStatus?: string;
    paymentStatus?: string;
    timeline?: OrderEvent[];
    customer?: Partial<OrderContact>;
    items: { productId: string; productName: string; unitName?: string; qty: number; totalMinor: number }[];
};

export type OrderEvent = { id: string; status: string; at: string; note?: string };

export function orderFinished(order: Order) {
    return ["completed", "cancelled", "expired"].includes(order.status) ||
        ["picked_up", "delivered", "cancelled"].includes(order.fulfillmentStatus ?? "");
}

const orderLabels: Record<string, string> = {
    awaiting_review: "Awaiting review",
    needs_confirmation: "Needs customer confirmation",
    details_resubmitted: "Customer details updated",
    approved: "Approved",
    packing: "Packing",
    packed: "Packed",
    ready_for_pickup: "Ready for pickup",
    out_for_delivery: "Out for delivery",
    picked_up: "Picked up",
    delivered: "Delivered",
    cancelled: "Cancelled",
    expired: "Reservation expired",
    awaiting_payment: "Awaiting online payment",
    paid: "Payment received",
    payment_review: "Payment under review",
    cash_at_pickup: "Cash due at pickup",
    cash_on_delivery: "Cash due on delivery",
    closed: "Payment closed",
    refund_pending: "Refund pending",
    refunded: "Refund recorded",
    reserved: "Order placed",
    completed: "Completed",
};

export function orderLabel(status: string) {
    return orderLabels[status] ?? status.replaceAll("_", " ");
}

export const checkoutTokenKey = "gims-checkout-token";

export async function checkoutPost(path: string, payload: object) {
    const { data } = await api.post<{ data: Order }>(`/checkout/${path}`, payload);
    return data.data;
}

export async function goToPayment(token: string) {
    sessionStorage.setItem(checkoutTokenKey, token);
    const order = await checkoutPost("payment/start", { token });
    if (order.paymentUrl) window.location.assign(order.paymentUrl);
}
export type OrderContact = {
    name: string;
    phone: string;
    address?: string;
    province?: string;
    district?: string;
};

export function orderContactFields(fields: FormData): OrderContact {
    return {
        name: String(fields.get("name") ?? ""),
        phone: String(fields.get("phone") ?? ""),
        province: String(fields.get("province") ?? "") || undefined,
        district: String(fields.get("district") ?? "") || undefined,
        address: String(fields.get("address") ?? "") || undefined,
    };
}

export function deliveryAddress(contact?: Partial<OrderContact>) {
    return [contact?.address, contact?.district, contact?.province].filter(Boolean).join(", ");
}

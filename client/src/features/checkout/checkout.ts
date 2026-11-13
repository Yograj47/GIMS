import api from "@/lib/api";

export type Order = {
    id: string;
    status: "reserved" | "expired" | "paid" | "completed" | "cancelled" | "payment_review";
    channel: "in_store" | "online";
    fulfillment: "counter" | "pickup" | "delivery";
    paymentMethod: "cash" | "gateway";
    totalMinor: number;
    expiresAt?: string;
    paymentUrl?: string;
    transactionId?: string;
    customer?: { name?: string; phone?: string; address?: string };
    items: { productId: string; productName: string; qty: number; totalMinor: number }[];
};

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

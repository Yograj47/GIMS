import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatInvoiceMoney } from "@/types/billing";
import { checkoutPost, checkoutTokenKey, goToPayment, type Order } from "./checkout";

export default function CheckoutStatus() {
    const [query] = useSearchParams();
    const [token] = useState(() => sessionStorage.getItem(checkoutTokenKey));
    const [order, setOrder] = useState<Order | null>(null);
    const [busy, setBusy] = useState(Boolean(token));
    const [error, setError] = useState("");
    const verifyOnReturn = query.has("pidx");

    useEffect(() => {
        if (!token) return;
        let active = true;
        checkoutPost(verifyOnReturn ? "payment/verify" : "status", { token }).catch(async () => {
            if (verifyOnReturn) return checkoutPost("status", { token });
            throw new Error("Could not load the order");
        }).then(
            (data) => { if (active) setOrder(data); },
            () => { if (active) setError("Order status could not be loaded."); },
        ).finally(() => { if (active) setBusy(false); });
        return () => { active = false; };
    }, [token, verifyOnReturn]);

    async function action(path: string) {
        if (!token) return;
        setBusy(true);
        setError("");
        try {
            if (path === "start") await goToPayment(token);
            else setOrder(await checkoutPost(path, { token }));
        } catch {
            setError("The order could not be updated. Try refreshing its status.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <main className="min-h-dvh bg-slate-50 p-5">
            <div className="mx-auto max-w-lg space-y-4 rounded-xl border bg-white p-6">
                <Link to="/shop" className="text-sm text-blue-700">Back to shop</Link>
                <h1 className="text-xl font-bold">Order status</h1>
                {!token && <p className="text-sm text-slate-600">There is no saved checkout in this tab.</p>}
                {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                {!order && busy && <Skeleton role="status" aria-label="Loading order" className="h-16 w-full" />}
                {order && (
                    <>
                        <p className="text-sm text-slate-600">Order {order.id.slice(-8).toUpperCase()} · {order.fulfillment}</p>
                        <p className="font-semibold">{formatInvoiceMoney(order.totalMinor, "NPR")}</p>
                        <p role="status" className="text-sm">
                            {order.status === "reserved" && (order.paymentMethod === "cash" ? `Reserved. Pay cash at ${order.fulfillment === "delivery" ? "delivery" : "pickup"}.` : "Reserved. Waiting for verified payment.")}
                            {order.status === "paid" && "Payment confirmed. The order is ready for staff to fulfill."}
                            {order.status === "completed" && "Order completed."}
                            {order.status === "cancelled" && "Order cancelled."}
                            {order.status === "expired" && "Reservation expired."}
                            {order.status === "payment_review" && "Payment received after the reservation ended. Contact the store with your order number."}
                        </p>
                        {order.status === "reserved" && order.expiresAt && <p className="text-sm text-slate-600">Reserved until {new Date(order.expiresAt).toLocaleString()}</p>}
                        {order.channel === "in_store" && <Link to="/stock-movements/orders" className="inline-block text-sm text-blue-700">Back to checkout orders</Link>}
                    </>
                )}
                {token && <div className="flex flex-wrap gap-2">
                    <Button variant="outline" disabled={busy} onClick={() => void action("status")}>Refresh status</Button>
                    {order?.status === "reserved" && order.paymentMethod === "cash" && <Button variant="outline" disabled={busy} onClick={() => void action("cancel")}>Cancel order</Button>}
                    {order?.paymentMethod === "gateway" && (order.status === "reserved" || order.status === "expired") && (
                        <Button variant="outline" disabled={busy} onClick={() => void action("payment/verify")}>Verify payment</Button>
                    )}
                    {order?.status === "reserved" && order.paymentMethod === "gateway" && (
                        <Button disabled={busy} onClick={() => void action("start")}>Continue to payment</Button>
                    )}
                </div>}
            </div>
        </main>
    );
}

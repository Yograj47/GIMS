import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import api from "@/lib/api";
import { formatInvoiceMoney } from "@/types/billing";
import { checkoutPost, type Order } from "./checkout";

export default function StaffOrders() {
    const [orders, setOrders] = useState<Order[] | null>(null);
    const [page, setPage] = useState(1);
    const [reload, setReload] = useState(0);
    const [busy, setBusy] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        api.get<{ data: Order[] }>("/checkout/staff/orders", { params: { page } }).then(
            ({ data }) => { if (active) setOrders(data.data); },
            () => { if (active) setError("Could not load checkout orders."); },
        );
        return () => { active = false; };
    }, [page, reload]);

    async function update(order: Order, action: "verify" | "fulfill") {
        setBusy(order.id);
        setError("");
        try {
            const next = await checkoutPost(`staff/orders/${order.id}/${action}`, { cashCollected: action === "fulfill" && order.paymentMethod === "cash" });
            setOrders((current) => current?.map((item) => item.id === next.id ? { ...item, ...next } : item) ?? []);
        } catch {
            setError("The order could not be updated.");
        } finally {
            setBusy("");
        }
    }

    return (
        <section className="mx-auto max-w-5xl space-y-4">
            <Link to="/stock-movements" className="text-sm text-brand-700">Back to stock movements</Link>
            <div className="flex items-center justify-between"><h1 className="text-xl font-bold">Checkout orders</h1><Button variant="outline" onClick={() => setReload(reload + 1)}>Refresh</Button></div>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            {!orders && !error && <LoadingSkeleton label="Loading checkout orders" />}
            {orders?.length === 0 && <p className="text-sm text-slate-600">No orders on this page.</p>}
            {orders?.map((order) => (
                <article key={order.id} className="space-y-3 rounded-lg border bg-white p-4 text-sm">
                    <div className="flex flex-wrap justify-between gap-3">
                        <h2 className="font-semibold">Order {order.id.slice(-8).toUpperCase()} · {order.channel === "online" ? "Online" : "In store"}</h2>
                        <span>{formatInvoiceMoney(order.totalMinor, "NPR")} · {order.paymentMethod === "cash" ? "Cash" : "Khalti"} · {order.status.replaceAll("_", " ")}</span>
                    </div>
                    <p className="text-slate-600">{order.items.map((item) => `${item.productName} × ${item.qty}`).join(", ")}</p>
                    <p className="text-slate-600 capitalize">{order.fulfillment}{order.customer?.name && ` · ${order.customer.name}`}{order.customer?.phone && ` · ${order.customer.phone}`}{order.customer?.address && ` · ${order.customer.address}`}</p>
                    <div className="flex flex-wrap gap-2">
                        {order.paymentMethod === "gateway" && (order.status === "reserved" || order.status === "expired") && <Button size="sm" variant="outline" disabled={Boolean(busy)} onClick={() => void update(order, "verify")}>Verify payment</Button>}
                        {(order.status === "paid" || (order.status === "reserved" && order.paymentMethod === "cash")) && <Button size="sm" disabled={Boolean(busy)} onClick={() => void update(order, "fulfill")}>{order.paymentMethod === "cash" ? "Cash collected · fulfill" : "Fulfill order"}</Button>}
                        {order.transactionId && <Button variant="outline" size="sm" asChild><Link to={`/reports/transaction/${order.transactionId}`}>View sale</Link></Button>}
                    </div>
                </article>
            ))}
            {(page > 1 || orders?.length === 25) && <div className="flex items-center gap-3">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <span className="text-sm">Page {page}</span>
                <Button variant="outline" disabled={orders?.length !== 25} onClick={() => setPage(page + 1)}>Next</Button>
            </div>}
        </section>
    );
}

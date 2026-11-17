import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, Package, Store, Truck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { formatInvoiceMoney } from "@/types/billing";
import { checkoutPost, deliveryAddress, orderFinished, orderLabel, type Order, type OrderContact } from "./checkout";
import OrderTracker, { OrderTimeline } from "./OrderTracker";
import OrderContactForm from "./OrderContactForm";
import { useOrderUpdates } from "./useOrderUpdates";
import { ShopOrdersSkeleton } from "./ShopLoading";

const historyDate = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

function OrderItems({ items }: { items: Order["items"] }) {
    return (
        <ul aria-label="Products ordered" className="divide-y divide-border border-y border-border">
            {items.map((item, index) => (
                <li key={index} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                        <p className="font-medium wrap-anywhere">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">Qty {item.qty}{item.unitName ? " · " + item.unitName : ""}</p>
                    </div>
                    <span className="shrink-0 tabular-nums">{formatInvoiceMoney(item.totalMinor, "NPR")}</span>
                </li>
            ))}
        </ul>
    );
}

function OrderHistoryEntry({ order, highlighted }: { order: Order; highlighted: boolean }) {
    const FulfillmentIcon = order.fulfillment === "delivery" ? Truck : order.fulfillment === "pickup" ? Store : Package;
    const fulfillment = order.fulfillment === "delivery" ? "Delivery" : order.fulfillment === "pickup" ? "Store pickup" : "In store";
    const active = !orderFinished(order);
    return (
        <li className="order-timeline-event relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-2 pb-4 last:pb-0 sm:gap-4">
            <span aria-hidden="true" className={`order-history-marker relative z-10 mt-2 grid size-9 place-items-center rounded-full border border-border motion-safe:transition-colors ${highlighted ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground"}`}>
                <FulfillmentIcon className="size-4" />
            </span>
            <article className="min-w-0 space-y-3 rounded-lg border border-border bg-card p-3 sm:p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        {order.createdAt && <time dateTime={order.createdAt} className="text-xs text-muted-foreground">
                            {historyDate.format(new Date(order.createdAt))}
                        </time>}
                        <h2 className="font-semibold">Order #{order.id.slice(-8).toUpperCase()}</h2>
                    </div>
                    <span className={`rounded-full border border-border px-2.5 py-1 text-xs font-medium ${active || order.status === "completed" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>
                        {orderLabel(order.fulfillmentStatus ?? order.status)}
                    </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {order.customer?.name && <p className="flex min-w-0 items-center gap-1.5 wrap-anywhere">
                        <UserRound aria-hidden="true" className="size-4 shrink-0" />{order.customer.name}
                    </p>}
                    <p>{fulfillment}</p>
                </div>
                <OrderItems items={order.items} />
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold tabular-nums">Total {formatInvoiceMoney(order.totalMinor, "NPR")}</p>
                    <Link to={"/shop/orders/" + order.id} className="inline-flex items-center gap-1.5 text-sm font-semibold text-link hover:underline"
                        aria-label={`${active ? "Track" : "View"} order #${order.id.slice(-8).toUpperCase()}`}>
                        {active ? "Track order" : "View order"} <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                </div>
            </article>
        </li>
    );
}

function OrderHistoryTimeline({ orders }: { orders: Order[] }) {
    const rail = useRef<HTMLOListElement>(null);
    const [highlighted, setHighlighted] = useState(0);

    useEffect(() => {
        const list = rail.current;
        if (!list) return;
        const markers = Array.from(list.querySelectorAll(".order-history-marker"));
        if (markers.length < 2) return;
        const historyList = list;
        let frame = 0;

        function update() {
            frame = 0;
            const centers = markers.map((marker) => {
                const bounds = marker.getBoundingClientRect();
                return bounds.top + bounds.height / 2;
            });
            const lastCenter = centers[centers.length - 1];
            const atPageEnd = window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;
            const readingLine = atPageEnd ? lastCenter : window.innerHeight * 0.28;
            const length = lastCenter - centers[0];
            const progress = Math.min(length, Math.max(0, readingLine - centers[0]));
            historyList.style.setProperty("--order-history-progress", `${progress}px`);
            const next = centers.findIndex((center) => center > readingLine);
            setHighlighted(next === -1 ? centers.length - 1 : Math.max(0, next - 1));
        }

        function scheduleUpdate() {
            if (!frame) frame = window.requestAnimationFrame(update);
        }

        const observer = new ResizeObserver(scheduleUpdate);
        observer.observe(list);
        window.addEventListener("scroll", scheduleUpdate, { passive: true });
        window.addEventListener("resize", scheduleUpdate);
        update();
        return () => {
            observer.disconnect();
            window.removeEventListener("scroll", scheduleUpdate);
            window.removeEventListener("resize", scheduleUpdate);
            window.cancelAnimationFrame(frame);
            historyList.style.removeProperty("--order-history-progress");
        };
    }, [orders]);

    return (
        <ol ref={rail} className="order-history-rail relative" aria-label="Order history, newest first">
            {orders.map((entry, index) => <OrderHistoryEntry key={entry.id} order={entry} highlighted={orders.length === 1 || highlighted === index} />)}
        </ol>
    );
}

export default function ShopOrders() {
    const { id } = useParams();
    const [params] = useSearchParams();
    const verifyOnReturn = params.has("pidx");
    const [page, setPage] = useState(1);
    const [reload, setReload] = useState(0);
    const [result, setResult] = useState<{ data: Order[]; total: number } | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const order = id ? result?.data.find((entry) => entry.id === id) : undefined;
    const finished = Boolean(order && orderFinished(order));

    const refreshFromSocket = useCallback(() => setReload((value) => value + 1), []);
    const handleOrderUpdate = useCallback(({ orderId }: { orderId: string }) => {
        if (!id || id === orderId) refreshFromSocket();
    }, [id, refreshFromSocket]);
    useOrderUpdates(handleOrderUpdate, refreshFromSocket, !finished || order?.fulfillmentStatus === "cancelled");

    useEffect(() => {
        const controller = new AbortController();
        const path = id ? `/checkout/customer/orders/${id}` : "/checkout/customer/orders";
        async function load() {
            try {
                if (id) {
                    const { data } = await api.get<{ data: Order }>(path, { signal: controller.signal });
                    if (!controller.signal.aborted) {
                        setResult({ data: [data.data], total: 1 });
                        setError("");
                    }
                } else {
                    const { data } = await api.get<{ data: Order[]; total: number }>(path, { params: { page }, signal: controller.signal });
                    if (!controller.signal.aborted) setResult(data);
                }
            } catch {
                if (!controller.signal.aborted) setError("Could not load your orders.");
            }
        }
        void load();
        return () => controller.abort();
    }, [id, page, reload]);

    useEffect(() => {
        if (!id || !verifyOnReturn) return;
        const controller = new AbortController();
        api.post(`/checkout/customer/orders/${id}/verify`, {}, { signal: controller.signal })
            .then(refreshFromSocket, () => {});
        return () => controller.abort();
    }, [id, verifyOnReturn, refreshFromSocket]);

    async function pay(orderId: string) {
        setBusy(true);
        try {
            const updated = await checkoutPost(`customer/orders/${orderId}/payment`, {});
            if (updated.paymentUrl) window.location.assign(updated.paymentUrl);
        } catch {
            // The API client reports provider and reservation errors.
        } finally {
            setBusy(false);
        }
    }

    async function checkPayment(orderId: string) {
        setBusy(true);
        try {
            const updated = await checkoutPost(`customer/orders/${orderId}/verify`, {});
            setResult({ data: [{ ...updated, customer: order?.customer }], total: 1 });
        } catch {
            // The API client reports errors and the last known status stays visible.
        } finally {
            setBusy(false);
        }
    }

    async function correctContact(contact: OrderContact) {
        if (!id) return;
        setBusy(true);
        try {
            const updated = await checkoutPost(`customer/orders/${id}/contact`, contact);
            setResult({ data: [updated], total: 1 });
        } catch {
            // The API client displays validation errors.
        } finally {
            setBusy(false);
        }
    }

    function refresh() {
        setError("");
        setResult(null);
        setReload((value) => value + 1);
    }

    return (
        <main className="mx-auto w-full max-w-4xl flex-1 space-y-5 px-4 py-8 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="shop-display text-3xl font-semibold">{id ? (finished ? "Order details" : "Track order") : "Order history"}</h1>
                <Link to={id ? "/shop/orders" : "/shop"} className="text-sm font-medium text-link hover:underline">
                    {id ? "All orders" : "Continue shopping"}
                </Link>
            </div>
            {error && <div role="alert" className="flex flex-wrap items-center gap-3"><p>{error}</p><Button variant="outline" onClick={refresh}>Try again</Button></div>}
            {!error && (!result || (id && !order)) && <ShopOrdersSkeleton detail={Boolean(id)} />}
            {order && (
                <section className="space-y-4 rounded-xl border border-border bg-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 className="font-semibold">Order #{order.id.slice(-8).toUpperCase()}</h2>
                            <p className="text-sm capitalize text-muted-foreground">{order.fulfillment} · {order.paymentMethod === "cash" ? "Cash" : "Khalti"}</p>
                        </div>
                        <p role="status" className="rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground">{orderLabel(order.fulfillmentStatus ?? order.status)}</p>
                    </div>
                    {order.paymentStatus && <p className="text-sm font-medium">Payment · {orderLabel(order.paymentStatus)}</p>}
                    {!finished && <OrderTracker order={order} />}
                    {order.customer && (
                        <div className="space-y-1 text-sm text-muted-foreground">
                            {order.customer.name && <p className="font-medium text-foreground">{order.customer.name}</p>}
                            {order.customer.phone && <p>Mobile · {order.customer.phone}</p>}
                            {order.fulfillment === "delivery" && deliveryAddress(order.customer) && <p>Delivery address · {deliveryAddress(order.customer)}</p>}
                        </div>
                    )}
                    {order.fulfillmentStatus === "needs_confirmation" && (
                        <OrderContactForm order={order} busy={busy} onSave={(contact) => void correctContact(contact)} />
                    )}
                    {order.timeline && order.timeline.length > 0 && (
                        <OrderTimeline events={order.timeline} completed={order.status === "completed"} />
                    )}
                    <OrderItems items={order.items} />
                    <p className="text-right font-semibold">Total {formatInvoiceMoney(order.totalMinor, "NPR")}</p>
                    {order.status === "reserved" && order.paymentMethod === "cash" && (
                        <p className="text-sm text-muted-foreground">Pay cash {order.fulfillment === "pickup" ? "at pickup" : "on delivery"}.</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {order.status === "reserved" && order.paymentMethod === "gateway" &&
                            <Button disabled={busy} onClick={() => void pay(order.id)}>{busy ? "Opening payment…" : "Pay with Khalti"}</Button>}
                        {order.status === "reserved" && order.paymentMethod === "gateway" && order.paymentUrl &&
                            <Button variant="outline" disabled={busy} onClick={() => void checkPayment(order.id)}>Check payment</Button>}
                        {!finished && <Button variant="outline" disabled={busy} onClick={refresh}>Refresh status</Button>}
                    </div>
                </section>
            )}
            {!id && result && (
                result.data.length ? (
                    <>
                        <OrderHistoryTimeline orders={result.data} />
                        {result.total > 20 && <div className="flex justify-between">
                            <Button variant="outline" disabled={page === 1} onClick={() => { setResult(null); setPage(page - 1); }}>Previous</Button>
                            <Button variant="outline" disabled={page * 20 >= result.total} onClick={() => { setResult(null); setPage(page + 1); }}>Next</Button>
                        </div>}
                    </>
                ) : <p className="rounded-xl border border-border bg-card p-5">You have no orders yet.</p>
            )}
        </main>
    );
}

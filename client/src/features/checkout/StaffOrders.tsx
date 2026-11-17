import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import api from "@/lib/api";
import { formatInvoiceMoney } from "@/types/billing";
import { checkoutPost, deliveryAddress, orderLabel, type Order } from "./checkout";
import OrderContactForm from "./OrderContactForm";
import { useOrderUpdates } from "./useOrderUpdates";
import "./order-work.css";

const packingActions: Record<string, { action: string; label: string }> = {
    approved: { action: "start_packing", label: "Start packing" },
    packing: { action: "mark_packed", label: "Mark packed" },
};

function PackingSlip({ order, onClose }: { order: Order | null; onClose: () => void }) {
    return (
        <Dialog open={Boolean(order)} onOpenChange={(open) => { if (!open) onClose(); }}>
            {order && <DialogContent className="order-packing-slip">
                <DialogTitle>Packing slip</DialogTitle>
                <p className="text-sm font-medium">Order #{order.id.slice(-8).toUpperCase()} · {order.fulfillment}</p>
                <OrderContact order={order} />
                <ul className="divide-y border-y">
                    {order.items.map((item, index) => (
                        <li key={index} className="flex justify-between gap-3 py-2 text-sm">
                            <span>{item.productName}</span>
                            <span>{item.qty} {item.unitName}</span>
                        </li>
                    ))}
                </ul>
                <p className="text-sm">{orderLabel(order.paymentStatus ?? order.status)} · {formatInvoiceMoney(order.totalMinor, "NPR")}</p>
                <Button className="order-print-control" onClick={() => window.print()}>Print packing slip</Button>
            </DialogContent>}
        </Dialog>
    );
}

function OrderContact({ order }: { order: Order }) {
    return (
        <div className="space-y-1 text-sm text-muted-foreground wrap-anywhere">
            <p className="font-medium text-foreground">{order.customer?.name || "Customer details unavailable"}</p>
            {order.customer?.phone && <p>Phone {order.customer.phone}</p>}
            {order.fulfillment === "delivery" && deliveryAddress(order.customer) && <p>Delivery address {deliveryAddress(order.customer)}</p>}
        </div>
    );
}

type NoteAction = "request_confirmation" | "cancel" | "record_refund";
const noteLabels: Record<NoteAction, string> = {
    request_confirmation: "Ask customer to correct details",
    cancel: "Cancel order",
    record_refund: "Record completed refund",
};

function WorkOrder({ order, management, busy, update, print }: {
    order: Order;
    management: boolean;
    busy: boolean;
    update: (route: string, payload?: object) => Promise<boolean>;
    print: () => void;
}) {
    const [noteAction, setNoteAction] = useState<NoteAction | null>(null);
    const [editContact, setEditContact] = useState(false);
    const [cashCollected, setCashCollected] = useState(false);
    const stage = order.fulfillmentStatus ?? order.status;
    const payment = order.paymentStatus ?? order.status;
    const reviewing = stage === "awaiting_review" || stage === "needs_confirmation";
    const handover = stage === "ready_for_pickup" || stage === "out_for_delivery";
    const canCancel = management && !["cancelled", "out_for_delivery", "picked_up", "delivered", "completed"].includes(stage);
    const lastNote = order.timeline?.filter((event) => event.status === stage).at(-1)?.note;

    const workflow = (action: string, fields: object = {}) => update("workflow", { action, ...fields });
    async function submitNote(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!noteAction) return;
        const note = new FormData(event.currentTarget).get("note");
        if (await workflow(noteAction, { note })) setNoteAction(null);
    }

    return (
        <article className="space-y-4 rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="font-semibold">Order #{order.id.slice(-8).toUpperCase()}</h2>
                    <p className="text-sm capitalize text-muted-foreground">{order.fulfillment} · {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}</p>
                </div>
                <div className="text-right text-sm">
                    <p className="font-semibold">{orderLabel(stage)}</p>
                    <p className="text-muted-foreground">{orderLabel(payment)}</p>
                </div>
            </div>
            <OrderContact order={order} />
            <ul className="divide-y border-y text-sm">
                {order.items.map((item, index) => <li key={index} className="flex justify-between gap-3 py-2">
                    <span>{item.productName} × {item.qty}{item.unitName ? " " + item.unitName : ""}</span>
                    <span className="shrink-0">{formatInvoiceMoney(item.totalMinor, "NPR")}</span>
                </li>)}
            </ul>
            <p className="text-right text-sm font-semibold">Total {formatInvoiceMoney(order.totalMinor, "NPR")}</p>
            {lastNote && <p className="rounded-md bg-muted p-3 text-sm">{lastNote}</p>}
            {handover && !management && order.paymentMethod === "cash" && (
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={cashCollected} onChange={(event) => setCashCollected(event.target.checked)} /> Cash collected</label>
            )}
            <div className="flex flex-wrap gap-2">
                {management && order.paymentMethod === "gateway" && order.paymentInitiated && ["awaiting_payment", "closed"].includes(payment) && (
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => void update("verify")}>Verify online payment</Button>
                )}
                {management && reviewing && stage === "awaiting_review" && (
                    <>
                        <Button size="sm" disabled={busy || (order.paymentMethod === "gateway" && payment !== "paid")} onClick={() => void workflow("approve")}>Approve and send to staff</Button>
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => setNoteAction("request_confirmation")}>Request correction</Button>
                    </>
                )}
                {management && stage === "needs_confirmation" && (
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => setEditContact(!editContact)}>Update confirmed details</Button>
                )}
                {canCancel && <Button size="sm" variant="outline" disabled={busy} onClick={() => setNoteAction("cancel")}>Cancel order</Button>}
                {management && payment === "refund_pending" && <Button size="sm" variant="outline" disabled={busy} onClick={() => setNoteAction("record_refund")}>Record completed refund</Button>}
                {!management && packingActions[stage] && (
                    <Button size="sm" disabled={busy} onClick={() => void workflow(packingActions[stage].action)}>{packingActions[stage].label}</Button>
                )}
                {!management && stage === "packed" && <Button size="sm" disabled={busy} onClick={() => void workflow("ready")}>
                    {order.fulfillment === "pickup" ? "Ready for pickup" : "Send out for delivery"}
                </Button>}
                {!management && ["packing", "packed", "ready_for_pickup", "out_for_delivery"].includes(stage) && (
                    <Button size="sm" variant="outline" onClick={print}>Packing slip</Button>
                )}
                {!management && handover && <Button size="sm" disabled={busy || (order.paymentMethod === "cash" && !cashCollected)}
                    onClick={() => void update("fulfill", { cashCollected })}>{stage === "ready_for_pickup" ? "Confirm pickup" : "Confirm delivery"}</Button>}
                {!management && order.channel === "in_store" && order.paymentMethod === "gateway" && ["reserved", "expired"].includes(order.status) && (
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => void update("verify")}>Verify payment</Button>
                )}
                {!management && order.channel === "in_store" && order.status === "paid" && (
                    <Button size="sm" disabled={busy} onClick={() => void update("fulfill")}>Complete sale</Button>
                )}
                {order.transactionId && <Button size="sm" variant="outline" asChild><Link to={`/reports/transaction/${order.transactionId}`}>View sale</Link></Button>}
            </div>
            {management && stage === "needs_confirmation" && editContact && (
                <OrderContactForm order={order} busy={busy} onSave={(contact) => void workflow("confirm_details", { contact })} />
            )}
            {noteAction && (
                <form key={noteAction} onSubmit={submitNote} className="space-y-2 rounded-md border border-border p-3">
                    <label className="grid gap-1 text-sm font-medium">
                        {noteAction === "record_refund" ? "Reference from the completed refund" : "Reason shown to the customer"}
                        <Input name="note" required maxLength={400} />
                    </label>
                    <Button size="sm" type="submit" disabled={busy}>{noteLabels[noteAction]}</Button>
                    <Button size="sm" type="button" variant="ghost" onClick={() => setNoteAction(null)}>Close</Button>
                </form>
            )}
        </article>
    );
}

export default function StaffOrders({ management = false }: { management?: boolean }) {
    const [result, setResult] = useState<{ data: Order[]; total: number } | null>(null);
    const [page, setPage] = useState(1);
    const [view, setView] = useState<"active" | "history">("active");
    const [reload, setReload] = useState(0);
    const [busy, setBusy] = useState("");
    const [error, setError] = useState("");
    const [slip, setSlip] = useState<Order | null>(null);
    const base = management ? "management/orders" : "staff/orders";
    const refresh = useCallback(() => setReload((value) => value + 1), []);
    useOrderUpdates(refresh, refresh);

    useEffect(() => {
        const controller = new AbortController();
        api.get<{ data: Order[]; total: number }>(`/checkout/${base}`, { params: { page, view }, signal: controller.signal }).then(
            ({ data }) => { if (!controller.signal.aborted) { setResult(data); setError(""); } },
            () => { if (!controller.signal.aborted) setError("Could not load orders."); },
        );
        return () => controller.abort();
    }, [base, page, view, reload]);

    async function update(id: string, route: string, payload: object = {}) {
        setBusy(id);
        try {
            await checkoutPost(`${base}/${id}/${route}`, payload);
            refresh();
            return true;
        } catch {
            // The shared API client displays the error.
            return false;
        } finally {
            setBusy("");
        }
    }

    return (
        <section className="w-full space-y-4 p-3 sm:p-4 lg:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-xl font-semibold">{management ? "Customer online orders" : "Active customer orders"}</h1>
                <Button variant="outline" onClick={refresh}>Refresh</Button>
            </div>
            <div role="group" aria-label="Order queues" className="flex gap-2">
                {(["active", "history"] as const).map((option) => (
                    <Button key={option} size="sm" variant={view === option ? "default" : "outline"} aria-pressed={view === option}
                        onClick={() => { if (view !== option) { setResult(null); setPage(1); setView(option); } }}>
                        {option === "history" ? "History" : management ? "Review queue" : "Active orders"}
                    </Button>
                ))}
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            {!result && !error && <LoadingSkeleton label="Loading orders" />}
            {result?.data.length === 0 && <p className="text-sm text-muted-foreground">No orders in this queue.</p>}
            <div className="grid gap-4 xl:grid-cols-2">
                {result?.data.map((order) => <WorkOrder key={order.id} order={order} management={management} busy={busy !== ""}
                    update={(route, payload) => update(order.id, route, payload)}
                    print={() => setSlip(order)} />)}
            </div>
            {result && (page > 1 || result.total > 25) && <nav aria-label="Order pages" className="flex items-center gap-3">
                <Button variant="outline" disabled={page === 1} onClick={() => { setResult(null); setPage(page - 1); }}>Previous</Button>
                <span className="text-sm">Page {page}</span>
                <Button variant="outline" disabled={page * 25 >= result.total} onClick={() => { setResult(null); setPage(page + 1); }}>Next</Button>
            </nav>}
            <PackingSlip order={slip} onClose={() => setSlip(null)} />
        </section>
    );
}

import {
    CircleCheck, CircleX, ClipboardCheck, Clock, CreditCard, History, MapPinCheck,
    MessageSquare, PackageCheck, PackageOpen, Receipt, RotateCcw, ShoppingBag, Store, Truck,
    type LucideIcon,
} from "lucide-react";
import { orderLabel, type Order, type OrderEvent } from "./checkout";
import "./order-tracker.css";

const stages = {
    awaiting_review: { icon: Clock, title: "Waiting for approval", detail: "The store is reviewing your order." },
    needs_confirmation: { icon: MessageSquare, title: "Your details need confirmation", detail: "Review the store’s note and update your contact details below." },
    approved: { icon: ClipboardCheck, title: "Order approved", detail: "The store will start packing your groceries." },
    packing: { icon: PackageOpen, title: "Packing your groceries", detail: "The store is preparing your items." },
    packed: { icon: PackageCheck, title: "Your groceries are packed", detail: "Check back for the next update." },
    ready_for_pickup: { icon: Store, title: "Ready for pickup", detail: "Your parcel is waiting for you at the store." },
    out_for_delivery: { icon: Truck, title: "On the way", detail: "Your groceries are out for delivery." },
};

const eventIcons: Record<string, LucideIcon> = {
    reserved: ShoppingBag,
    details_resubmitted: MessageSquare,
    picked_up: ShoppingBag,
    delivered: MapPinCheck,
    completed: CircleCheck,
    cancelled: CircleX,
    expired: Clock,
    awaiting_payment: CreditCard,
    paid: Receipt,
    payment_review: CreditCard,
    refund_pending: RotateCcw,
    refunded: RotateCcw,
};

const eventDate = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

export function OrderTimeline({ events, completed }: { events: OrderEvent[]; completed: boolean }) {
    return (
        <section aria-labelledby="order-timeline" className="overflow-hidden rounded-lg border border-border">
            <h3 id="order-timeline" className="flex items-center gap-2 border-b border-border px-4 py-3 font-semibold">
                <History aria-hidden="true" className="size-4 text-link" /> Order timeline
            </h3>
            <ol className="p-3 sm:p-4">
                {events.map((event, index) => {
                    const latest = index === events.length - 1;
                    const muted = completed && !latest;
                    const markerColor = latest ? "border-border bg-accent text-accent-foreground"
                        : muted ? "border-neutral-200 bg-neutral-100 text-neutral-600" : "border-border bg-card text-link";
                    const Icon = stages[event.status as keyof typeof stages]?.icon ?? eventIcons[event.status] ?? History;
                    return (
                        <li key={event.id} className="order-timeline-event relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 pb-2 last:pb-0">
                            <span aria-hidden="true" className={`relative z-10 mt-2 grid size-9 place-items-center rounded-full border ${markerColor}`}>
                                <Icon className="size-4" />
                            </span>
                            <div className={`min-w-0 rounded-md px-3 py-2 ${latest ? "bg-accent/25" : ""} ${muted ? "text-neutral-600" : ""}`}>
                                <div className="flex flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-4">
                                    <p className="text-sm font-semibold">{orderLabel(event.status)}{latest && <span className="sr-only"> (latest update)</span>}</p>
                                    <time dateTime={event.at} className={`text-xs tabular-nums ${muted ? "text-neutral-600" : "text-muted-foreground"}`}>{eventDate.format(new Date(event.at))}</time>
                                </div>
                                {event.note && <p className={`mt-1 wrap-anywhere text-sm ${muted ? "text-neutral-600" : "text-muted-foreground"}`}>{event.note}</p>}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}

export default function OrderTracker({ order }: { order: Order }) {
    const stage = order.fulfillmentStatus ?? "awaiting_review";
    const waitingForPayment = stage === "awaiting_review" && order.paymentMethod === "gateway" && order.status === "reserved";
    const state = waitingForPayment
        ? { icon: CreditCard, title: "Waiting for payment", detail: "Complete payment with Khalti so the store can approve your order." }
        : stages[stage as keyof typeof stages] ?? stages.awaiting_review;
    const Icon = state.icon;
    return (
        <div className="flex items-center gap-4 rounded-lg border border-border bg-accent/30 p-4" aria-live="polite">
            <div aria-hidden="true" className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-accent text-accent-foreground">
                {stage === "out_for_delivery" ? <span className="order-tracker-road" /> : <span className="order-tracker-halo" />}
                <Icon key={state.title} className="order-tracker-enter relative size-7" />
            </div>
            <div key={state.title} className="order-tracker-enter">
                <p className="font-semibold">{state.title}</p>
                <p className="text-sm text-muted-foreground">{state.detail}</p>
            </div>
        </div>
    );
}

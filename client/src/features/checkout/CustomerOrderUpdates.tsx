import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { notify } from "@/lib/toast";
import api from "@/lib/api";
import { readStorage, writeStorage } from "@/lib/browserStorage";
import { orderLabel, type OrderEvent } from "./checkout";
import { useOrderUpdates, type OrderUpdate } from "./useOrderUpdates";

export default function CustomerOrderUpdates({ accountKey }: { accountKey: string }) {
    const storageKey = `shop-order-updates-seen:${accountKey}`;
    const [seen, setSeen] = useState(() => readStorage("local", storageKey) ?? "");
    const [open, setOpen] = useState(false);
    const [updates, setUpdates] = useState<(OrderEvent & { orderId: string })[]>();
    const [error, setError] = useState(false);
    const [reload, setReload] = useState(0);
    const refresh = useCallback(() => setReload((value) => value + 1), []);
    const onUpdate = useCallback(({ orderId, status }: OrderUpdate) => {
        notify.info(orderLabel(status), `Order #${orderId.slice(-8).toUpperCase()}`);
        refresh();
    }, [refresh]);
    useOrderUpdates(onUpdate, refresh);

    useEffect(() => {
        const controller = new AbortController();
        api.get<{ data: (OrderEvent & { orderId: string })[] }>("/checkout/customer/order-updates", { signal: controller.signal }).then(
            ({ data }) => { if (!controller.signal.aborted) { setUpdates(data.data); setError(false); } },
            () => { if (!controller.signal.aborted) setError(true); },
        );
        return () => controller.abort();
    }, [reload]);

    const seenIndex = updates?.findIndex((event) => event.id === seen) ?? -1;
    const unread = seenIndex < 0 ? updates?.length ?? 0 : seenIndex;

    function markSeen() {
        const latest = updates?.[0]?.id;
        if (!latest) return;
        setSeen(latest);
        writeStorage("local", storageKey, latest);
    }

    return (
        <Dialog open={open} onOpenChange={(next) => {
            setOpen(next);
            if (next) { markSeen(); refresh(); }
        }}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" aria-label={unread ? `Order updates, ${unread} unread` : "Order updates"}>
                    <Bell aria-hidden="true" />{unread > 0 && <span className="rounded-full bg-accent px-1.5 text-xs text-accent-foreground">{unread}</span>}
                </Button>
            </DialogTrigger>
            <DialogContent className="shop-surface max-h-[85dvh] overflow-y-auto bg-card text-foreground">
                <DialogTitle>Order updates</DialogTitle>
                {error && <p role="alert">Could not load order updates. <button type="button" className="text-link underline" onClick={refresh}>Try again</button></p>}
                {!updates && !error && <div role="status" className="space-y-3">
                    <span className="sr-only">Loading order updates</span>
                    {[0, 1, 2].map((index) => <div key={index} aria-hidden="true" className="space-y-2 rounded-md border border-border p-3">
                        <Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-3/4" />
                    </div>)}
                </div>}
                {updates?.length === 0 && <p className="text-sm text-muted-foreground">No order updates yet.</p>}
                <ul className="divide-y divide-border">
                    {updates?.map((event) => (
                        <li key={event.id}>
                            <Link to={`/shop/orders/${event.orderId}`} onClick={() => { markSeen(); setOpen(false); }}
                                className="block rounded-md p-3 hover:bg-muted">
                                <p className="font-medium">{orderLabel(event.status)}</p>
                                <p className="text-xs text-muted-foreground">Order #{event.orderId.slice(-8).toUpperCase()} · {new Date(event.at).toLocaleString()}</p>
                                {event.note && <p className="mt-1 text-sm text-muted-foreground">{event.note}</p>}
                            </Link>
                        </li>
                    ))}
                </ul>
            </DialogContent>
        </Dialog>
    );
}

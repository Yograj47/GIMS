import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { orderContactFields, type Order, type OrderContact } from "./checkout";
import OrderAddressFields from "./OrderAddressFields";

export default function OrderContactForm({ order, busy, onSave }: {
    order: Order;
    busy: boolean;
    onSave: (contact: OrderContact) => void;
}) {
    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSave(orderContactFields(new FormData(event.currentTarget)));
    }

    return (
        <form onSubmit={submit} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">Name<Input name="name" required maxLength={120} defaultValue={order.customer?.name} /></label>
            <label className="grid gap-1 text-sm">Mobile number<Input name="phone" type="tel" required maxLength={30} autoComplete="tel" defaultValue={order.customer?.phone} /></label>
            {order.fulfillment === "delivery" && <OrderAddressFields contact={order.customer} />}
            <Button className="justify-self-start" size="sm" type="submit" disabled={busy}>Submit corrected details</Button>
        </form>
    );
}

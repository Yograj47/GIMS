import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Banknote, CreditCard, ShoppingBag, Store, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { formatInvoiceMoney } from "@/types/billing";
import { checkoutPost, orderContactFields } from "./checkout";
import OrderAddressFields from "./OrderAddressFields";
import { lineTotal, useShopCart } from "./shopCart";

export default function ShopCheckout({ checkout = false }: { checkout?: boolean }) {
    const { cart, setCart } = useShopCart();
    const user = useAuthStore((state) => state.user);
    const [fulfillment, setFulfillment] = useState("pickup");
    const [onlineEnabled, setOnlineEnabled] = useState(false);
    const [methodsLoading, setMethodsLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [busy, setBusy] = useState(false);
    const attempt = useRef<{ payload: string; token: string } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!checkout) return;
        const controller = new AbortController();
        api.get<{ data: { gatewayEnabled: boolean } }>("/checkout/methods", { signal: controller.signal })
            .then(({ data }) => { if (!controller.signal.aborted) setOnlineEnabled(data.data.gatewayEnabled); })
            .catch(() => {})
            .finally(() => { if (!controller.signal.aborted) setMethodsLoading(false); });
        return () => controller.abort();
    }, [checkout]);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy || !cart.length) return;
        const fields = new FormData(event.currentTarget);
        const payload = {
            items: cart.map(({ product, unit, quantity }) => ({ productId: product.id, unitId: unit.id, quantity })),
            fulfillment,
            paymentMethod: fields.get("paymentMethod"),
            customer: orderContactFields(fields),
        };
        const signature = JSON.stringify(payload);
        if (attempt.current?.payload !== signature) attempt.current = { payload: signature, token: crypto.randomUUID() };
        setBusy(true);
        try {
            const order = await checkoutPost("customer/orders", { ...payload, token: attempt.current.token });
            setCart([]);
            navigate("/shop/orders/" + order.id, { replace: true });
            if (order.paymentMethod === "gateway") {
                const payment = await checkoutPost(`customer/orders/${order.id}/payment`, {});
                if (payment.paymentUrl) window.location.assign(payment.paymentUrl);
            }
        } catch {
            // An existing order can resume payment from its tracking page.
        } finally {
            setBusy(false);
        }
    }

    return (
        <main className={`mx-auto w-full flex-1 space-y-5 px-4 py-8 sm:px-6 ${checkout ? "max-w-6xl" : "max-w-4xl"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="shop-display text-3xl font-semibold">{checkout ? "Checkout" : "Your cart"}</h1>
                <Link to={checkout ? "/shop/cart" : "/shop"} className="text-sm font-medium text-link hover:underline">
                    {checkout ? "Back to cart" : "Continue shopping"}
                </Link>
            </div>
            {!cart.length ? <p className="rounded-lg border border-border bg-card p-5">Your cart is empty.</p> : <div className={checkout ? "grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.57fr)]" : "space-y-4"}>
                {checkout && (
                    <form id="shop-checkout" onSubmit={submit} className="divide-y divide-border rounded-xl border border-border bg-card">
                        <section className="space-y-3 p-5">
                            <h2 className="font-semibold">Contact details</h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="grid gap-1.5 text-sm font-medium">Full name<Input name="name" required maxLength={120} autoComplete="name" defaultValue={user?.name} /></label>
                                <label className="grid gap-1.5 text-sm font-medium">Mobile number
                                    <Input name="phone" type="tel" required maxLength={30} autoComplete="tel" placeholder="e.g. 9841234567" defaultValue={user?.phone ?? ""} />
                                </label>
                            </div>
                            <p className="text-xs text-muted-foreground">The store may call this number about your order.</p>
                        </section>
                        <section className="space-y-3 p-5">
                            <h2 id="checkout-fulfillment" className="font-semibold">Receive your order</h2>
                            <div role="radiogroup" aria-labelledby="checkout-fulfillment" className="grid gap-3 sm:grid-cols-2">
                                <CheckoutOption name="fulfillment" value="pickup" selected={fulfillment} onChange={setFulfillment} icon={Store}
                                    title="Store pickup" description="Collect your order at the store." />
                                <CheckoutOption name="fulfillment" value="delivery" selected={fulfillment} onChange={setFulfillment} icon={Truck}
                                    title="Delivery" description="Have your order sent to your address." />
                            </div>
                            <fieldset disabled={fulfillment !== "delivery"} hidden={fulfillment !== "delivery"}
                                className="grid gap-4 pt-2 sm:grid-cols-2 [&[hidden]]:hidden">
                                <legend className="sr-only">Delivery address</legend>
                                <OrderAddressFields contact={user?.deliveryAddress ?? undefined} />
                            </fieldset>
                        </section>
                        <section className="space-y-3 p-5">
                            <h2 id="checkout-payment" className="font-semibold">Payment method</h2>
                            <div role="radiogroup" aria-labelledby="checkout-payment" className="grid gap-3 sm:grid-cols-2">
                                <CheckoutOption name="paymentMethod" value="cash" selected={paymentMethod} onChange={setPaymentMethod} icon={Banknote}
                                    title={fulfillment === "pickup" ? "Cash at pickup" : "Cash on delivery"} description="Pay when you receive your order." />
                                {methodsLoading ? <Skeleton role="status" aria-label="Checking online payment availability" className="min-h-16 w-full" /> : <CheckoutOption name="paymentMethod" value="gateway" selected={paymentMethod} onChange={setPaymentMethod} icon={CreditCard}
                                    title="Pay online with Khalti" disabled={!onlineEnabled}
                                    description={onlineEnabled ? "Continue to Khalti to pay." : "Online payment is currently unavailable."} />}
                            </div>
                        </section>
                    </form>
                )}
                <section aria-label={checkout ? "Order summary" : "Cart items"} className="rounded-xl border border-border bg-card p-5">
                    {checkout && <h2 className="mb-2 flex items-center gap-2 font-semibold"><ShoppingBag aria-hidden="true" className="size-4" /> Order summary</h2>}
                    <ul className="divide-y divide-border">
                        {cart.map((line) => (
                            <li key={line.product.id + ":" + line.unit.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                                <div>
                                    <p className="font-medium">{line.product.name}</p>
                                    <p className="text-sm text-muted-foreground">{line.quantity} × {line.unit.name}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{formatInvoiceMoney(lineTotal(line), "NPR")}</span>
                                    {!checkout && <Button variant="ghost" size="sm" aria-label={"Remove " + line.product.name}
                                        onClick={() => setCart((current) => current.filter((item) => item !== line))}>Remove</Button>}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <p className="border-t border-border pt-3 text-right font-semibold">
                        Estimated total {formatInvoiceMoney(cart.reduce((sum, line) => sum + lineTotal(line), 0), "NPR")}
                    </p>
                    {checkout && <Button form="shop-checkout" type="submit" className="mt-4 w-full" disabled={busy}>
                        {busy ? "Placing order…" : paymentMethod === "gateway" ? "Continue to Khalti" : "Place order"}
                    </Button>}
                </section>
                {!checkout && <Button asChild><Link to="/shop/checkout">Checkout</Link></Button>}
            </div>}
        </main>
    );
}

function CheckoutOption({ name, value, selected, onChange, icon: Icon, title, description, disabled }: {
    name: string;
    value: string;
    selected: string;
    onChange: (value: string) => void;
    icon: typeof Store;
    title: string;
    description: string;
    disabled?: boolean;
}) {
    return (
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 has-checked:border-primary has-checked:bg-accent/30 has-disabled:cursor-not-allowed has-disabled:opacity-60">
            <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-link" />
            <span className="flex-1">
                <span className="block text-sm font-semibold">{title}</span>
                <span className="block text-xs text-muted-foreground">{description}</span>
            </span>
            <input type="radio" className="mt-1 accent-primary" name={name} value={value} checked={selected === value}
                onChange={() => onChange(value)} disabled={disabled} />
        </label>
    );
}

import { ThemeControl } from "@/components/common/ThemeControl";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatInvoiceMoney } from "@/types/billing";
import api from "@/lib/api";
import { checkoutPost, checkoutTokenKey, goToPayment } from "./checkout";

type Unit = { id: string; name: string; multiplier: number; fractional: boolean };
type Product = { id: string; name: string; price: number; available: number; units: Unit[] };
type CartLine = { product: Product; unit: Unit; quantity: number };
type Catalog = { data: Product[]; meta: { totalItems: number; pageSize: number; gatewayEnabled: boolean } };
const field = "min-w-0 rounded-md border border-input bg-card px-3 py-2 text-sm";

function ProductCard({ product, add }: { product: Product; add: (line: CartLine) => void }) {
    const [unitId, setUnitId] = useState("");
    const unit = product.units.find((item) => item.id === unitId) ?? product.units[0];
    const [quantity, setQuantity] = useState("1");
    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (unit) add({ product, unit, quantity: Number(quantity) });
    }
    return (
        <form onSubmit={submit} className="space-y-3 rounded-lg border border-border bg-card p-4">
            <div><h2 className="font-semibold">{product.name}</h2><p className="text-sm text-muted-foreground">{product.available} base units available</p></div>
            {unit && <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1 text-sm">Unit
                    <select className={field} value={unit.id} onChange={(event) => setUnitId(event.target.value)}>
                        {product.units.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                </label>
                <label className="grid gap-1 text-sm">Quantity
                    <input className={field} type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} min={unit.fractional ? 0.001 : 1} step={unit.fractional ? "any" : 1} required />
                </label>
            </div>}
            <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{unit && formatInvoiceMoney(Math.round(product.price * unit.multiplier * 100), "NPR")}</span>
                <Button type="submit" size="sm" disabled={!unit || product.available < (unit?.fractional ? 0.001 : 1) * (unit?.multiplier ?? 1)}>Add to cart</Button>
            </div>
        </form>
    );
}

export default function Shop() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [catalog, setCatalog] = useState<Catalog | null>(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [cart, setCart] = useState<CartLine[]>([]);
    const [fulfillment, setFulfillment] = useState("pickup");
    const [busy, setBusy] = useState(false);
    const pending = useRef<{ signature: string; token: string } | null>(null);

    useEffect(() => {
        let active = true;
        api.get<Catalog>("/checkout/catalog", { params: { page } }).then(
            ({ data }) => { if (active) setCatalog(data); },
            () => { if (active) setError("Could not load the shop. Refresh to try again."); },
        );
        return () => { active = false; };
    }, [page]);

    function add(line: CartLine) {
        setCart((current) => {
            const existing = current.find((item) => item.product.id === line.product.id && item.unit.id === line.unit.id);
            if (!existing) return [...current, line];
            return current.map((item) => item === existing ? { ...item, quantity: item.quantity + line.quantity } : item);
        });
        setNotice(`${line.product.name} added to cart`);
    }

    async function checkout(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy || !cart.length) return;
        setBusy(true);
        setError("");
        const form = new FormData(event.currentTarget);
        const value = (name: string) => String(form.get(name) ?? "").trim();
        const payload = {
            items: cart.map((item) => ({ productId: item.product.id, unitId: item.unit.id, quantity: item.quantity })),
            fulfillment,
            paymentMethod: value("method"),
            customer: { name: value("name"), phone: value("phone"), address: value("address") },
        };
        const signature = JSON.stringify(payload);
        if (pending.current?.signature !== signature) pending.current = { signature, token: crypto.randomUUID() };
        const token = pending.current.token;
        try {
            await checkoutPost("orders", { ...payload, token });
            sessionStorage.setItem(checkoutTokenKey, token);
            if (payload.paymentMethod === "gateway") {
                try { await goToPayment(token); } catch { navigate("/checkout/return"); }
            } else navigate("/checkout/return");
        } catch {
            setError("Checkout could not be completed. Check availability and try again.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="min-h-dvh bg-background text-foreground">
            <header className="border-b bg-card">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4">
                    <Link to="/shop" className="flex items-center gap-2 text-lg font-bold"><span className="grid size-9 place-items-center rounded-lg bg-brand-soft"><Box className="size-5 text-brand-soft-foreground" /></span> GroceryPro</Link>
                    <ThemeControl />
                    <Link to="/checkout/return" className="text-sm text-link">Order status</Link>
                </div>
            </header>
            <main className="mx-auto grid max-w-7xl gap-6 px-5 py-7 lg:grid-cols-[1fr_340px]">
                <section className="space-y-4">
                    <h1 className="rounded-lg border-l-4 border-chart-2 bg-brand-soft text-brand-soft-foreground px-5 py-4 text-2xl font-bold">Shop groceries</h1>
                    {notice && <p role="status" className="sr-only">{notice}</p>}
                    {catalog ? (
                        <>
                            {catalog.data.length === 0 && <p>No products available.</p>}
                            <div className="grid gap-3 sm:grid-cols-2">{catalog.data.map((product) => <ProductCard key={product.id} product={product} add={add} />)}</div>
                            {catalog.meta.totalItems > catalog.meta.pageSize && <div className="flex items-center gap-3">
                                <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                                <span className="text-sm">Page {page}</span>
                                <Button variant="outline" disabled={page * catalog.meta.pageSize >= catalog.meta.totalItems} onClick={() => setPage(page + 1)}>Next</Button>
                            </div>}
                        </>
                    ) : !error && <Skeleton role="status" aria-label="Loading shop" className="h-56 w-full" />}
                </section>
                <form onSubmit={checkout} className="h-fit space-y-4 rounded-xl border border-border bg-card p-5">
                    <h2 className="border-b-2 border-chart-2/60 pb-3 text-lg font-bold">Your cart</h2>
                    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                    {cart.length === 0 ? <p className="text-sm text-muted-foreground">Add an item to get started.</p> : (
                        <>
                            <ul className="divide-y">{cart.map((item) => <li key={`${item.product.id}:${item.unit.id}`} className="flex items-center justify-between gap-2 py-2 text-sm">
                                <span>{item.product.name} · {item.quantity} {item.unit.name}</span>
                                <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => setCart((current) => current.filter((line) => line !== item))}>Remove</Button>
                            </li>)}</ul>
                            <p className="text-sm font-semibold">Estimated total {formatInvoiceMoney(cart.reduce((total, item) => total + Math.round(Math.round(item.product.price * item.unit.multiplier * 100) * item.quantity), 0), "NPR")}</p>
                            <label className="grid gap-1 text-sm">Fulfillment<select className={field} value={fulfillment} onChange={(event) => setFulfillment(event.target.value)}><option value="pickup">Store pickup</option><option value="delivery">Delivery</option></select></label>
                            <label className="grid gap-1 text-sm">Name<input className={field} name="name" required maxLength={120} /></label>
                            <label className="grid gap-1 text-sm">Phone<input className={field} name="phone" type="tel" required maxLength={30} /></label>
                            {fulfillment === "delivery" && <label className="grid gap-1 text-sm">Delivery address<textarea className={field} name="address" required maxLength={500} /></label>}
                            <label className="grid gap-1 text-sm">Payment
                                <select className={field} name="method">
                                    <option value="cash">{fulfillment === "delivery" ? "Cash on delivery" : "Cash at pickup"}</option>
                                    {catalog?.meta.gatewayEnabled && <option value="gateway">Card or wallet via Khalti</option>}
                                </select>
                            </label>
                            <Button className="w-full" type="submit" disabled={busy}>{busy ? "Reserving stock…" : "Place order"}</Button>
                        </>
                    )}
                </form>
            </main>
        </div>
    );
}

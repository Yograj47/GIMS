import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { formatInvoiceMoney } from "@/types/billing";
import { useAuthStore } from "@/store/authStore";
import { useShopCart, type ShopProduct } from "./shopCart";
import ShopProductPhoto from "./ShopProductPhoto";
import ShopProductCard from "./ShopProductCard";
import { ShopProductSkeleton } from "./ShopLoading";

type ProductDetail = {
    product: ShopProduct;
    category: { id: string; name: string } | null;
    related: ShopProduct[];
};

function ProductGallery({ product }: { product: ShopProduct }) {
    const [selected, setSelected] = useState<string>();
    const photos = product.photos ?? [];
    const active = photos.find(({ mediaId }) => mediaId === selected) ?? product.cover;
    return (
        <div className="min-w-0 max-w-80 space-y-2">
            <ShopProductPhoto name={product.name} photo={active} eager className="aspect-square w-full rounded-xl" />
            {photos.length > 1 && <div role="group" aria-label="Product photos" className="flex flex-wrap gap-1.5">
                {photos.map((photo, index) => (
                    <button key={photo.mediaId} type="button" aria-label={`Show photo ${index + 1}`}
                        aria-pressed={active?.mediaId === photo.mediaId} onClick={() => setSelected(photo.mediaId)}
                        className="rounded-md border border-border p-0.5 aria-pressed:border-primary hover:border-primary">
                        <ShopProductPhoto name="" photo={{ ...photo, altText: "" }} className="size-10 rounded-sm" />
                    </button>
                ))}
            </div>}
        </div>
    );
}

function PurchasePanel({ product }: { product: ShopProduct }) {
    const user = useAuthStore((state) => state.user);
    const location = useLocation();
    const canShop = user?.role === "customer" && user.isVerified;
    const [unitId, setUnitId] = useState(product.units[0]?.id);
    const [quantity, setQuantity] = useState("1");
    const [added, setAdded] = useState(false);
    const { cart, setCart } = useShopCart();
    const unit = product.units.find((option) => option.id === unitId) ?? product.units[0];
    const inCart = cart.filter((line) => line.product.id === product.id)
        .reduce((total, line) => total + line.quantity * line.unit.multiplier, 0);
    const remaining = unit ? Math.max(0, (product.available - inCart) / unit.multiplier) : 0;
    const currentQuantity = cart.find((line) => line.product.id === product.id && line.unit.id === unit?.id)?.quantity ?? 0;
    const maxQuantity = Math.min(remaining, 10000 - currentQuantity);
    const amount = Number(quantity);
    const canAdd = unit && amount >= 0.001 && amount <= maxQuantity &&
        (unit.fractional || Number.isInteger(amount));

    function addToCart() {
        if (!canShop || !unit || !canAdd) return;
        setCart((current) => {
            const index = current.findIndex((line) => line.product.id === product.id && line.unit.id === unit.id);
            if (index === -1) return [...current, { product, unit, quantity: amount }];
            return current.map((line, position) => position === index
                ? { product, unit, quantity: Number((line.quantity + amount).toFixed(3)) }
                : line);
        });
        setAdded(true);
    }

    return (
        <div className="space-y-5">
            {unit && <p className="text-lg text-muted-foreground">
                <span className="font-semibold tabular-nums text-foreground">{formatInvoiceMoney(Math.round(product.price * unit.multiplier * 100), "NPR")}</span>
                {" / "}{unit.name}
            </p>}
            {product.available <= 0 || !unit ? (
                <p className="text-sm text-muted-foreground">{product.available <= 0 ? "Out of stock online · 0 available" : "Ordering units are unavailable."}</p>
            ) : canShop ? (
                <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); addToCart(); }}>
                    {product.units.length > 1 && <label className="block text-sm font-medium">
                        Unit
                        <select className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2" value={unit.id}
                            onChange={(event) => { setUnitId(event.target.value); setAdded(false); }}>
                            {product.units.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
                        </select>
                    </label>}
                    <label className="block text-sm font-medium">
                        Quantity
                        <input aria-label={`Quantity for ${product.name}`} type="number" required min={unit.fractional ? 0.001 : 1}
                            max={maxQuantity} step={unit.fractional ? 0.001 : 1}
                            value={quantity} onChange={(event) => { setQuantity(event.target.value); setAdded(false); }}
                            className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2" />
                    </label>
                    <Button type="submit" className="w-full sm:w-auto" disabled={!canAdd}>Add to cart</Button>
                    {added && <p role="status" className="text-xs text-muted-foreground">Added to cart</p>}
                </form>
            ) : !user ? (
                <Button asChild><Link to="/shop/login" state={{ from: location }}>Sign in to order</Link></Button>
            ) : user.role === "customer" ? (
                <Button asChild><Link to="/shop/verify">Verify your account to order</Link></Button>
            ) : null}
            {canShop && added && <Link to="/shop/cart" className="inline-block text-sm font-medium text-link hover:underline">View cart</Link>}
        </div>
    );
}

function ProductDetails({ id }: { id: string }) {
    const [detail, setDetail] = useState<ProductDetail>();
    const [error, setError] = useState(false);
    const [retry, setRetry] = useState(0);
    const heading = useRef<HTMLHeadingElement>(null);
    const { state } = useLocation();
    const backTo = state?.from?.pathname;
    const catalogLink = backTo === "/shop" || backTo === "/shop/all/" || backTo === "/shop/all"
        ? { pathname: backTo, search: state.from.search, hash: state.from.hash }
        : "/shop/all/";

    useEffect(() => {
        const controller = new AbortController();
        window.scrollTo({ top: 0, behavior: "instant" });
        api.get<{ data: ProductDetail }>(`/checkout/catalog/products/${encodeURIComponent(id)}`, { signal: controller.signal }).then(
            ({ data }) => { if (!controller.signal.aborted) setDetail(data.data); },
            () => { if (!controller.signal.aborted) setError(true); },
        );
        return () => controller.abort();
    }, [id, retry]);

    useEffect(() => {
        if (detail) heading.current?.focus({ preventScroll: true });
    }, [detail]);

    return (
        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-8">
            <Link to={catalogLink} className="inline-flex items-center gap-1 text-sm font-medium text-link hover:underline">
                <ChevronLeft className="size-4" aria-hidden="true" /> Back to groceries
            </Link>
            {error && (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-5">
                    <p role="alert">This product could not be loaded.</p>
                    <Button variant="outline" onClick={() => { setError(false); setRetry((value) => value + 1); }}>Try again</Button>
                </div>
            )}
            {!detail && !error && <ShopProductSkeleton />}
            {detail && (
                <div className={detail.related.length
                    ? "grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] lg:gap-8"
                    : "max-w-2xl"}>
                    <article className="grid items-start gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:items-center sm:gap-6 sm:p-6">
                        <ProductGallery product={detail.product} />
                        <div className="flex min-w-0 flex-col gap-4">
                            <div className="space-y-2">
                                {detail.category && <Link to={`/shop/all/?category=${detail.category.id}#shop-results`} className="text-sm font-medium text-link hover:underline">{detail.category.name}</Link>}
                                <h1 ref={heading} tabIndex={-1} className="shop-display text-2xl font-semibold tracking-tight wrap-anywhere sm:text-3xl">{detail.product.name}</h1>
                            </div>
                            <PurchasePanel product={detail.product} />
                        </div>
                    </article>
                    {detail.related.length > 0 && (
                        <section aria-labelledby="related-products">
                            <h2 id="related-products" className="shop-display mb-3 text-2xl font-semibold">Related products</h2>
                            <div className="grid gap-2">
                                {detail.related.map((product, index) => <ShopProductCard key={product.id} product={product} index={index} compact />)}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </main>
    );
}

export default function ShopProductDetail() {
    const { id = "" } = useParams();
    return <ProductDetails key={id} id={id} />;
}

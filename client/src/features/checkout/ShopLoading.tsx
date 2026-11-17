import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const card = "space-y-3 rounded-lg border border-border bg-card p-4";
const grid = "grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:gap-5";

function Placeholder({ label, children }: { label: string; children: ReactNode }) {
    return <div role="status"><span className="sr-only">{label}</span><div aria-hidden="true">{children}</div></div>;
}

function ProductCards() {
    return (
        <div className={grid}>
            {[0, 1, 2, 3].map((index) => (
                <div key={index} className="overflow-hidden rounded-xl border border-border bg-card">
                    <Skeleton className="aspect-square rounded-none" />
                    <div className="space-y-2 p-3"><Skeleton className="h-4 w-4/5" /><Skeleton className="h-3 w-1/2" /></div>
                </div>
            ))}
        </div>
    );
}

export function ShopCatalogSkeleton() {
    return <Placeholder label="Loading products"><ProductCards /></Placeholder>;
}

export function ShopCategoriesSkeleton() {
    return (
        <Placeholder label="Loading categories">
            <div className="flex gap-3 overflow-hidden">
                {[0, 1, 2, 3, 4].map((index) => (
                    <div key={index} className={`${card} grid w-32 shrink-0 justify-items-center sm:w-40`}>
                        <Skeleton className="size-16 rounded-full sm:size-20" /><Skeleton className="h-3 w-20" />
                    </div>
                ))}
            </div>
        </Placeholder>
    );
}

function ProductDetailPlaceholder() {
    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] lg:gap-8">
            <div className="grid items-center gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[2fr_3fr] sm:p-6">
                <Skeleton className="aspect-square w-full max-w-80 rounded-xl" />
                <div className="space-y-4"><Skeleton className="h-3 w-24" /><Skeleton className="h-8 w-4/5" /><Skeleton className="h-5 w-32" /><Skeleton className="h-9 w-36" /></div>
            </div>
            <div className="space-y-2">
                <Skeleton className="mb-3 h-6 w-40" />
                {[0, 1, 2].map((index) => <div key={index} className="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5">
                    <Skeleton className="size-16 shrink-0" />
                    <div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
                </div>)}
            </div>
        </div>
    );
}

export function ShopProductSkeleton() {
    return <Placeholder label="Loading product"><ProductDetailPlaceholder /></Placeholder>;
}

function OrdersPlaceholder({ detail }: { detail: boolean }) {
    return detail ? (
        <div className={card}>
            <Skeleton className="h-5 w-36" /><Skeleton className="h-16 w-full" />
            <Skeleton className="h-28 w-full" /><Skeleton className="h-10 w-full" />
        </div>
    ) : (
        <div className="space-y-4">
            {[0, 1, 2].map((index) => <div key={index} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3">
                <Skeleton className="mt-2 size-9 rounded-full" />
                <div className={card}><Skeleton className="h-3 w-28" /><Skeleton className="h-5 w-36" /><Skeleton className="h-10 w-full" /><Skeleton className="h-4 w-24" /></div>
            </div>)}
        </div>
    );
}

export function ShopOrdersSkeleton({ detail }: { detail: boolean }) {
    return <Placeholder label={detail ? "Loading order details" : "Loading order history"}><OrdersPlaceholder detail={detail} /></Placeholder>;
}

function FormPlaceholder({ fields = 3 }: { fields?: number }) {
    return <div className={card}>
        <Skeleton className="h-5 w-36" />
        {Array.from({ length: fields }, (_, index) => <Skeleton key={index} className="h-9 w-full" />)}
    </div>;
}

export function ShopPageSkeleton() {
    const { pathname, search } = useLocation();
    const path = pathname.replace(/\/$/, "");
    const params = new URLSearchParams(search);
    const product = path.startsWith("/shop/products/") || params.has("product");
    const orders = path === "/shop/orders" || path.startsWith("/shop/orders/");
    const profile = path === "/shop/profile";
    const checkout = path === "/shop/checkout";
    const cart = path === "/shop/cart";
    const listing = path === "/shop/all" || ["q", "category", "all"].some((key) => params.has(key));
    const home = path === "/shop" && !listing && !product;
    const auth = !product && !orders && !profile && !checkout && !cart && !listing && !home;
    return (
        <main className={`mx-auto w-full flex-1 space-y-5 px-4 py-6 sm:px-6 ${auth ? "max-w-md self-center sm:py-12" : orders || cart ? "max-w-4xl" : profile || checkout ? "max-w-6xl" : "max-w-7xl"}`}>
            <Placeholder label={product ? "Loading product" : orders ? "Loading orders" : profile ? "Loading profile" : checkout ? "Loading checkout" : cart ? "Loading cart" : auth ? "Loading account page" : "Loading groceries"}>
                <div className="space-y-5">
                    {!home && !auth && <Skeleton className="h-8 w-40" />}
                    {home && <><Skeleton className="h-72 w-full rounded-2xl sm:h-80" /><div className="grid gap-3 sm:grid-cols-3">{[0, 1, 2].map((index) => <Skeleton key={index} className="h-20" />)}</div><ProductCards /></>}
                    {listing && !product && (path === "/shop/all" ? <div className="grid items-start gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]"><FormPlaceholder /><ProductCards /></div> : <ProductCards />)}
                    {product && <ProductDetailPlaceholder />}
                    {orders && <OrdersPlaceholder detail={path !== "/shop/orders"} />}
                    {profile && <div className="grid items-start gap-4 lg:grid-cols-[minmax(15rem,0.38fr)_minmax(0,1fr)]"><div className={card}><Skeleton className="size-12 rounded-full" /><Skeleton className="h-5 w-32" /><Skeleton className="h-8 w-full" /></div><div className="space-y-4"><FormPlaceholder /><FormPlaceholder fields={2} /></div></div>}
                    {checkout && <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.57fr)]"><FormPlaceholder fields={5} /><FormPlaceholder fields={2} /></div>}
                    {(cart || auth) && <FormPlaceholder />}
                </div>
            </Placeholder>
        </main>
    );
}

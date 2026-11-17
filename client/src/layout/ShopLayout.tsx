import { Suspense, useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useSearchParams } from "react-router-dom";
import { ChevronDown, Mail, ShoppingBag, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { publicInfoLinks, supportEmail } from "@/features/OtherPages/publicInfo";
import api from "@/lib/api";
import { workspaceHome } from "@/shared/constants/roles";
import { cartKey, readCart } from "@/features/checkout/shopCart";
import ShopSearch from "@/features/checkout/ShopSearch";
import CustomerOrderUpdates from "@/features/checkout/CustomerOrderUpdates";
import { ShopPageSkeleton } from "@/features/checkout/ShopLoading";
import { useAuthStore } from "@/store/authStore";
import "@/features/checkout/shop.css";

export default function ShopLayout() {
    const [params] = useSearchParams();
    const query = params.get("q") ?? "";
    const { user, logout, isLoading } = useAuth();
    const checkingSession = useAuthStore((state) => state.isInitialLoading);
    const canShop = user?.role === "customer" && user.isVerified;
    const workspace = user && user.role !== "customer" ? workspaceHome(user.role) : null;
    const [storeName, setStoreName] = useState("Grocery Store");

    const [cart, setCart] = useState(readCart);
    const [accountOpen, setAccountOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const updateHeader = () => setScrolled(window.scrollY > 0);
        updateHeader();
        window.addEventListener("scroll", updateHeader, { passive: true });
        return () => window.removeEventListener("scroll", updateHeader);
    }, []);

    useEffect(() => {
        sessionStorage.setItem(cartKey, JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        const controller = new AbortController();
        api.get<{ storeName: string }>("/checkout/storefront", { signal: controller.signal })
            .then(({ data }) => { if (!controller.signal.aborted) setStoreName(data.storeName); })
            .catch(() => {});
        return () => controller.abort();
    }, []);

    return (
        <div className="shop-surface flex min-h-dvh flex-col bg-background text-foreground">
            <header data-scrolled={scrolled} className="shop-header sticky top-0 z-30 border-b border-transparent">
                <div className="mx-auto flex min-h-14 max-w-7xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 py-2 sm:gap-x-5 sm:px-6">
                    <Link to="/shop" className="shop-display min-w-0 flex-1 text-lg leading-tight font-semibold tracking-tight wrap-anywhere sm:text-xl lg:flex-none">
                        {storeName}
                    </Link>
                    <ShopSearch key={query} initialQuery={query} />
                    <nav aria-label="Storefront navigation" className="flex shrink-0 items-center gap-1 text-sm sm:gap-2">
                        {canShop && <CustomerOrderUpdates key={user.email} accountKey={user.email} />}
                        {user?.role === "customer" && (
                            <div className="relative" onBlur={(event) => {
                                if (!event.currentTarget.contains(event.relatedTarget)) setAccountOpen(false);
                            }} onKeyDown={(event) => {
                                if (event.key === "Escape") {
                                    setAccountOpen(false);
                                    event.currentTarget.querySelector("button")?.focus();
                                }
                            }}>
                                <Button type="button" variant="ghost" size="sm" aria-expanded={accountOpen} aria-controls="shop-account-links"
                                    onClick={() => setAccountOpen((open) => !open)}>
                                    <UserRound aria-hidden="true" /> <span className="sr-only sm:not-sr-only">Account</span> <ChevronDown aria-hidden="true" className="hidden sm:block" />
                                </Button>
                                <div id="shop-account-links" hidden={!accountOpen} className="absolute right-0 top-full mt-2 w-44 rounded-lg border border-border bg-card p-1.5 shadow-lg">
                                    <NavLink to="/shop/orders" onClick={() => setAccountOpen(false)} className="block rounded-md px-3 py-2 hover:bg-muted">Orders</NavLink>
                                    <NavLink to="/shop/profile" onClick={() => setAccountOpen(false)} className="block rounded-md px-3 py-2 hover:bg-muted">Profile</NavLink>
                                    <button type="button" disabled={isLoading} className="w-full rounded-md px-3 py-2 text-left hover:bg-muted"
                                        onClick={() => { setAccountOpen(false); void logout().catch(() => undefined); }}>Sign out</button>
                                </div>
                            </div>
                        )}
                        {checkingSession && !user && <Skeleton className="h-8 w-32" />}
                        {!checkingSession && !user && <>
                            <Button size="sm" variant="ghost" asChild><Link to="/shop/login">Sign in</Link></Button>
                            <Button size="sm" asChild><Link to="/shop/register">Register</Link></Button>
                        </>}
                        {workspace && <Button variant="ghost" size="sm" asChild><Link to={workspace}>Workspace</Link></Button>}
                        {canShop && <Button size="sm" variant="outline" asChild>
                            <NavLink to="/shop/cart" className="aria-[current=page]:bg-accent">
                                <ShoppingBag aria-hidden="true" /> <span className="sr-only sm:not-sr-only">Cart</span>
                                <span className="rounded-full bg-accent px-1.5 text-xs tabular-nums text-accent-foreground">{cart.length}</span>
                            </NavLink>
                        </Button>}
                    </nav>
                </div>
            </header>

            <Suspense fallback={<ShopPageSkeleton />}>
                <Outlet context={{ cart, setCart }} />
            </Suspense>
            <footer className="border-t border-border bg-card">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="grid grid-cols-2 gap-x-5 gap-y-7 py-9 sm:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_1.35fr]">
                        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
                            <Link to="/shop" className="shop-display text-2xl font-semibold tracking-tight">{storeName}</Link>
                            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                                Pantry staples with prices by unit. Choose store pickup or delivery at checkout.
                            </p>
                        </div>
                        <nav aria-label="Footer shopping links">
                            <h2 className="mb-3 text-sm font-semibold">Shop</h2>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link to="/shop" className="hover:text-link hover:underline">Browse groceries</Link></li>
                                {canShop && <>
                                    <li><Link to="/shop/cart" className="hover:text-link hover:underline">Your cart</Link></li>
                                    <li><Link to="/shop/orders" className="hover:text-link hover:underline">Track orders</Link></li>
                                </>}
                            </ul>
                        </nav>
                        <nav aria-label="Footer company links">
                            <h2 className="mb-3 text-sm font-semibold">Company</h2>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                {publicInfoLinks.filter(({ to }) => to !== "/contact").map(({ to, label }) => (
                                    <li key={to}><Link to={to} className="hover:text-link hover:underline">{label}</Link></li>
                                ))}
                            </ul>
                        </nav>
                        <section className="col-span-2 min-w-0 sm:col-span-1" aria-labelledby="shop-contact-heading">
                            <h2 id="shop-contact-heading" className="mb-3 text-sm font-semibold">Contact</h2>
                            <a href={`mailto:${supportEmail}`} className="flex items-start gap-2 text-sm text-link wrap-anywhere hover:underline">
                                <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {supportEmail}
                            </a>
                            <Link to="/contact" className="mt-2 inline-block text-sm text-muted-foreground hover:text-link hover:underline">Contact support</Link>
                        </section>
                    </div>
                    <div className="border-t border-border py-4 text-xs text-muted-foreground">
                        © {new Date().getFullYear()} {storeName}
                    </div>
                </div>
            </footer>
        </div>
    );
}

export function ShopAccountPage({ children }: { children: ReactNode }) {
    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
            <div className="w-full max-w-md">{children}</div>
        </main>
    );
}

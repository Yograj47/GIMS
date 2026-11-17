import { GroceryProLogo } from "@/components/common/GroceryProLogo";
import { ThemeControl } from "@/components/common/ThemeControl";
import { AuthSkeleton } from "@/components/common/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { publicInfoLinks } from "@/features/OtherPages/publicInfo";
import { ArrowUpRight, ShoppingBasket } from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Suspense } from "react";

export default function AuthLayout() {
    const { pathname } = useLocation();
    const workspace = pathname === "/" || pathname === "/login";
    const info = publicInfoLinks.some(({ to }) => to === pathname);
    const themed = workspace || info || pathname === "/verify" || pathname === "/forget-password";

    return (
        <div className={`grid min-h-dvh grid-rows-[auto_1fr_auto] ${themed ? "bg-background text-foreground" : "bg-brand-950 text-slate-200"}`}>
            <header className={themed ? "border-b border-border bg-card" : "border-b border-white/10"}>
                <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8 xl:px-0">
                    <Link to="/">
                        <GroceryProLogo />
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <ThemeControl icons />
                        <span className="hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
                        <Button variant={themed ? "outline" : "ghost"} size="sm" asChild>
                            <Link to="/shop">
                                <ShoppingBasket className="size-4" aria-hidden="true" />
                                Shop
                                <ArrowUpRight className="hidden size-3.5 sm:block" aria-hidden="true" />
                            </Link>
                        </Button>
                        {!workspace && <Button size="sm" asChild><Link to="/login">Sign in</Link></Button>}
                    </div>
                </div>
            </header>
            <main className="relative flex min-w-0 items-center justify-center px-4 py-8 sm:px-8 sm:py-12">
                {workspace && <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_24%_30%,var(--accent),transparent_70%)]" />}
                <div className={`relative w-full ${workspace ? "max-w-5xl" : info ? "max-w-2xl" : pathname === "/help" ? "max-w-6xl" : "max-w-md"}`}>
                    <Suspense key={pathname} fallback={<AuthSkeleton />}><Outlet /></Suspense>
                </div>
            </main>
            <footer className={themed ? "border-t border-border bg-card" : "border-t border-white/10"}>
                <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-4 text-sm sm:px-8 xl:px-0">
                    <span className={themed ? "text-muted-foreground" : "text-slate-300"}>© {new Date().getFullYear()} GroceryPro</span>
                    <nav aria-label="Company and policies" className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        {publicInfoLinks.map(({ to, label }) => (
                            <NavLink key={to} to={to} className="font-medium underline-offset-4 hover:underline aria-[current=page]:underline">
                                {label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </footer>
        </div>
    );
}

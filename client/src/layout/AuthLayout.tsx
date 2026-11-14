import { ThemeControl } from "@/components/common/ThemeControl";
import { Button } from "@/components/ui/button";
import { Box } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Suspense } from "react";
import { AuthSkeleton } from "@/components/common/LoadingSkeleton";

export default function AuthLayout() {
    const { pathname } = useLocation();
    const wide = pathname === "/help" || pathname === "/";

    return (
        <div className="grid min-h-dvh grid-rows-[auto_1fr_auto] bg-brand-950 text-slate-200">
            <header className="border-b border-white/10">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-8">
                    <Link to="/" className="flex items-center gap-2 font-semibold text-white">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-soft-foreground"><Box size={18} aria-hidden="true" /></span>
                        GroceryPro
                    </Link>
                    <nav aria-label="Public pages" className="flex flex-wrap items-center gap-1 sm:gap-3">
                        <ThemeControl />
                        <Button variant="ghost" size="sm" className="text-slate-200 hover:bg-white/10 hover:text-white" asChild><Link to="/shop">Shop</Link></Button>
                        <Button variant="ghost" size="sm" className="text-slate-200 hover:bg-white/10 hover:text-white" asChild><Link to="/login">Sign in</Link></Button>
                        <Button size="sm" asChild><Link to="/register">Register</Link></Button>
                    </nav>
                </div>
            </header>
            <main className="flex min-w-0 items-center justify-center px-4 py-8 sm:px-8 sm:py-12">
                <div className={wide ? "w-full max-w-6xl" : "w-full max-w-md"}>
                    <Suspense key={pathname} fallback={<AuthSkeleton />}><Outlet /></Suspense>
                </div>
            </main>
            <footer className="border-t border-white/10 px-4 py-4 sm:px-8">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 text-sm text-slate-300">
                    <span>© {new Date().getFullYear()} GroceryPro</span>
                    <Link to="/help" className="underline-offset-4 hover:underline">Support</Link>
                </div>
            </footer>
        </div>
    );
}

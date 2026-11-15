import { managementLinks } from "@/components/common/managementLinks";
import { WorkspaceNotifications } from "@/components/common/WorkspaceNotifications";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { staffActions } from "./staffNavigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowLeft, BarChart3, BookOpen, Calculator, ClipboardList, LayoutGrid, Menu, Receipt, Ruler, Store, Truck, UserRound, X } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ThemeControl } from "@/components/common/ThemeControl";
import { useAuthStore } from "@/store/authStore";
import { useGlobalStore } from "@/store/globalStore";
import { workspaceHome } from "@/shared/constants/roles";
import { cn } from "@/lib/utils";

const salesPath = "/reports/transactions";
const accountingLinks = [
    { label: "Work queue", to: "/accounting", icon: ClipboardList },
    { label: "Sales and invoices", to: salesPath, icon: Receipt },
    { label: "Sales by channel", to: salesPath + "?view=channels", icon: BarChart3 },
    { label: "Supplier billing", to: "/suppliers", icon: Truck },
    { label: "Accounting report", to: "/reports/accounting", icon: BookOpen },
];

const staffLinks = staffActions;

const settingsLinks = [
    { label: "General", to: "/settings", icon: Store },
    { label: "Categories", to: "/settings/categories", icon: LayoutGrid },
    { label: "Measurement units", to: "/settings/units", icon: Ruler },
    { label: "Product units", to: "/settings/uoms", icon: Calculator },
];

export default function FocusedWorkspace({ section = "workspace" }: { section?: "workspace" | "settings" }) {
    const role = useAuthStore((state) => state.user?.role);
    const { pathname, search, key } = useLocation();
    const [menuKey, setMenuKey] = useState<string | null>(null);
    const inSettings = section === "settings";
    const accountant = role === "accountant";
    const management = role === "admin" || role === "owner";
    const settings = useGlobalStore((state) => state.settings);
    const fetchSettings = useGlobalStore((state) => state.fetchSettings);
    useEffect(() => {
        if (management && !inSettings && !settings) void fetchSettings();
    }, [management, inSettings, settings, fetchSettings]);
    const menuOpen = menuKey === key;
    useEffect(() => {
        const desktop = window.matchMedia("(min-width: 64rem)");
        const closeOnDesktop = (event: MediaQueryListEvent) => { if (event.matches) setMenuKey(null); };
        desktop.addEventListener("change", closeOnDesktop);
        return () => desktop.removeEventListener("change", closeOnDesktop);
    }, []);
    const channelView = new URLSearchParams(search).get("view") === "channels";
    const activePath = pathname === salesPath && channelView ? salesPath + "?view=channels"
        : pathname.startsWith("/reports/transaction/") ? salesPath
        : pathname.startsWith("/suppliers/") ? "/suppliers" : pathname;

    const links = inSettings ? settingsLinks : management ? managementLinks.filter((item) => item.roles.includes(role))
        : accountant ? accountingLinks : staffLinks;
    const isCurrent = (to: string) => {
        if (inSettings) return pathname === to;
        if (!management) return activePath === to;
        if (to === "/reports" && pathname === "/reports/activity") return false;
        if (to === "/stock-movements" && pathname === "/stock-movements/orders") return false;
        return pathname === to || pathname.startsWith(to + "/");
    };
    const loadingLayout = pathname === "/dashboard" ? "dashboard" : pathname === "/settings" ? "form" : /\/(add|edit|form)(\/|$)/.test(pathname) ? "form" : "table";
    const navigationLabel = inSettings ? "Settings" : management ? "Management workspace" : accountant ? "Accounting workspace" : "Staff workspace";
    const home = workspaceHome(role);

    const sidebar = (
        <>
            <div className="shrink-0 border-b border-border px-4 py-4 pr-14 lg:pr-4">
                {inSettings ? (
                    <Link to="/dashboard" onClick={() => setMenuKey(null)} className="inline-flex min-h-8 items-center gap-2 text-sm font-medium text-link hover:underline">
                        <ArrowLeft aria-hidden="true" className="size-4 shrink-0" /> Dashboard
                    </Link>
                ) : <Link to={home} onClick={() => setMenuKey(null)} className="inline-flex items-center gap-2 text-sm font-semibold">
                    <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Store aria-hidden="true" className="size-4" /></span>
                    <span className="min-w-0 break-words">{management ? settings?.storeName || "GroceryPro" : "GroceryPro"}</span>
                </Link>}
            </div>
            <nav aria-label={navigationLabel} className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
                {links.map(({ label, to, icon: Icon }) => (
                    <Link key={to} to={to} onClick={() => setMenuKey(null)} aria-current={isCurrent(to) ? "page" : undefined}
                        className={cn("flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium",
                            isCurrent(to) ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-card hover:text-foreground")}>
                        <Icon aria-hidden="true" className="size-4 shrink-0" />{label}
                    </Link>
                ))}
            </nav>
            <footer className="shrink-0 border-t border-border px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                {management && !inSettings && <WorkspaceNotifications onNavigate={() => setMenuKey(null)} />}
                <div className="divide-y divide-border rounded-xl border border-border bg-card">
                    {!inSettings && <Link to="/me" onClick={() => setMenuKey(null)} aria-current={pathname === "/me" ? "page" : undefined}
                        className={cn("flex min-h-11 items-center gap-2.5 rounded-t-xl px-2.5 text-sm font-medium hover:bg-muted",
                            pathname === "/me" && "bg-accent text-accent-foreground")}>
                        <span className="grid size-7 place-items-center rounded-full bg-accent text-accent-foreground"><UserRound aria-hidden="true" className="size-4" /></span>
                        My account
                    </Link>}
                    <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-2">
                        <span className="text-xs font-medium text-muted-foreground">Theme</span>
                        <ThemeControl icons />
                    </div>
                </div>
            </footer>
        </>
    );

    return (
        <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] print:block">
            <aside className="no-print sticky top-0 hidden h-dvh flex-col border-r border-border bg-muted/50 lg:flex">
                {sidebar}
            </aside>
            <div className="min-w-0">
                <div className="no-print flex items-center gap-2 px-3 pt-3 sm:px-4 lg:hidden">
                    <Dialog open={menuOpen} onOpenChange={(open) => setMenuKey(open ? key : null)}>
                        <DialogTrigger asChild>
                            <button type="button" aria-label={`Open ${navigationLabel.toLowerCase()} navigation`} className="grid size-10 place-items-center rounded-lg border border-border bg-card text-foreground hover:bg-muted">
                                <Menu aria-hidden="true" className="size-5" />
                            </button>
                        </DialogTrigger>
                        <DialogContent aria-describedby={undefined} showCloseButton={false}
                            className="inset-y-0 left-0 top-0 flex h-dvh max-h-none w-[min(19rem,calc(100%-2.5rem))] max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-y-0 border-l-0 bg-background p-0 sm:max-w-none sm:p-0 data-[state=open]:slide-in-from-left-full data-[state=closed]:slide-out-to-left-full lg:hidden">
                            <DialogTitle className="sr-only">{navigationLabel} navigation</DialogTitle>
                            <button type="button" aria-label="Close navigation" onClick={() => setMenuKey(null)}
                                className="absolute right-3 top-3 grid size-9 place-items-center rounded-md text-muted-foreground hover:bg-muted">
                                <X aria-hidden="true" className="size-5" />
                            </button>
                            {sidebar}
                        </DialogContent>
                    </Dialog>
                    {inSettings && (
                        <Link to="/dashboard" className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium text-link hover:bg-muted">
                            <ArrowLeft aria-hidden="true" className="size-4" /> Dashboard
                        </Link>
                    )}
                </div>
                <div className={cn("workspace-content min-w-0", management && "p-3 sm:p-4 lg:p-5")}>
                    <Suspense key={pathname} fallback={<LoadingSkeleton layout={loadingLayout} />}>
                        <Outlet />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}

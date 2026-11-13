import { Suspense } from "react";
import { ArrowLeft, Box, Calculator, LayoutGrid, Ruler, Settings2, Store } from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { cn } from "@/lib/utils";

const sections = [
    { title: "Store", links: [{ label: "General", to: "/settings", icon: Store }] },
    { title: "Inventory", links: [
        { label: "Categories", to: "/settings/categories", icon: LayoutGrid },
        { label: "Measurement units", to: "/settings/units", icon: Ruler },
        { label: "Product units", to: "/settings/uoms", icon: Calculator },
    ] },
];

function SectionLinks({ mobile = false }: { mobile?: boolean }) {
    return sections.map(({ title, links }) => (
        <div key={title} className={mobile ? "contents" : "space-y-1"}>
            {!mobile && <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h2>}
            {links.map(({ label, to, icon: Icon }) => (
                <NavLink key={to} to={to} end
                    className={({ isActive }) => cn(
                        "flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-brand-600",
                        mobile && "shrink-0 whitespace-nowrap",
                        isActive ? "bg-brand-100 text-brand-700" : "text-slate-600 hover:bg-white hover:text-slate-950",
                    )}>
                    <Icon size={17} className="shrink-0" aria-hidden="true" />
                    {label}
                </NavLink>
            ))}
        </div>
    ));
}

export default function SettingsLayout() {
    const { pathname } = useLocation();

    return (
        <div className="min-h-dvh bg-white text-slate-900 md:grid md:grid-cols-[11rem_minmax(0,1fr)] lg:grid-cols-[4.25rem_12rem_minmax(0,1fr)] xl:grid-cols-[4.25rem_14rem_minmax(0,1fr)] print:block">
            <aside aria-label="Workspace shortcuts" className="no-print sticky top-0 hidden h-dvh flex-col items-center gap-3 self-start border-r border-slate-200 bg-market-paper py-4 lg:flex">
                <Link to="/dashboard" aria-label="Back to dashboard" title="Back to dashboard" className="grid size-11 place-items-center rounded-xl bg-market-yellow text-brand-700 hover:bg-brand-100">
                    <Box size={22} aria-hidden="true" />
                </Link>
                <div className="h-px w-8 bg-slate-200" />
                <Link to="/settings" aria-label="General settings" title="General settings" className="grid size-11 place-items-center rounded-xl bg-brand-600 text-white hover:bg-brand-700">
                    <Settings2 size={20} aria-hidden="true" />
                </Link>
            </aside>
            <aside className="no-print sticky top-0 hidden h-dvh self-start overflow-y-auto border-r border-slate-200 bg-slate-50 px-3 py-5 md:block">
                <Link to="/dashboard" className="mb-7 flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-brand-700 hover:bg-white lg:hidden">
                    <ArrowLeft size={17} aria-hidden="true" /> Dashboard
                </Link>
                <nav aria-label="Settings sections" className="space-y-6"><SectionLinks /></nav>
            </aside>
            <div className="min-w-0">
                <header className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white">
                    <div className="flex min-h-16 items-center gap-3 px-3 sm:px-6 xl:px-8">
                        <Link to="/dashboard" aria-label="Back to dashboard" className="grid size-11 shrink-0 place-items-center rounded-lg text-brand-700 hover:bg-brand-50 md:hidden">
                            <ArrowLeft size={20} aria-hidden="true" />
                        </Link>
                        <Settings2 size={20} aria-hidden="true" className="hidden text-brand-600 md:block" />
                        <p className="text-lg font-semibold">Settings</p>
                    </div>
                    <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto bg-slate-50 px-3 py-1.5 md:hidden">
                        <SectionLinks mobile />
                    </nav>
                </header>
                <main className="workspace-content mx-auto w-full min-w-0 max-w-[82rem] px-3 py-4 sm:px-6 sm:py-6 xl:px-8">
                    <Suspense key={pathname} fallback={<LoadingSkeleton layout={pathname === "/settings" ? "form" : "table"} />}>
                        <Outlet />
                    </Suspense>
                </main>
            </div>
        </div>
    );
}

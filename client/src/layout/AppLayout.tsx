import { Suspense, useRef, useState } from "react";
import { Box, Menu, X } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { WorkspaceNavigation } from "@/components/common/SideBar";
import AppHeader from "@/components/common/AppHeader";

export default function AppLayout() {
    const { pathname, key } = useLocation();
    const [openAt, setOpenAt] = useState<string | null>(null);
    const menuButton = useRef<HTMLButtonElement>(null);
    const isOpen = openAt === key;
    const loadingLayout = pathname === "/dashboard" ? "dashboard" : /\/(add|edit|form)(\/|$)/.test(pathname) ? "form" : "table";

    return (
        <div className="min-h-dvh bg-market-paper text-slate-900 lg:grid lg:grid-cols-[4.5rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,1fr)] print:block">
            <aside className="no-print sticky top-0 hidden h-dvh self-start overflow-y-auto border-r border-slate-200 bg-white p-3 lg:block">
                <Link to="/dashboard" aria-label="GroceryPro dashboard" className="mb-7 flex items-center gap-3 rounded-lg p-1.5 lg:max-xl:justify-center">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-market-yellow text-brand-700"><Box size={20} aria-hidden="true" /></span>
                    <span className="hidden font-bold xl:inline">Grocery<span className="text-brand-600">Pro</span></span>
                </Link>
                <WorkspaceNavigation />
            </aside>
            <div className="min-w-0">
                <div className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white">
                    <AppHeader navigationControl={
                        <button ref={menuButton} type="button" aria-label={isOpen ? "Close navigation" : "Open navigation"}
                            aria-expanded={isOpen} aria-controls="workspace-menu"
                            onClick={() => setOpenAt(isOpen ? null : key)}
                            className="grid size-11 shrink-0 place-items-center rounded-lg text-brand-700 hover:bg-brand-50 lg:hidden">
                            {isOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    } />
                </div>
                <div id="workspace-menu" hidden={!isOpen} className="no-print border-b border-slate-200 bg-white p-2 sm:p-4 lg:hidden"
                    onKeyDown={(event) => {
                        if (event.key === "Escape") {
                            setOpenAt(null);
                            menuButton.current?.focus();
                        }
                    }}>
                    <WorkspaceNavigation compact onNavigate={() => setOpenAt(null)} />
                </div>
                <main className="workspace-content min-w-0">
                    <div className="mx-auto w-full max-w-[90rem] px-3 py-4 sm:px-6 sm:py-6 xl:px-8">
                        <Suspense key={pathname} fallback={<LoadingSkeleton layout={loadingLayout} />}>
                            <Outlet />
                        </Suspense>
                    </div>
                </main>
            </div>
        </div>
    );
}

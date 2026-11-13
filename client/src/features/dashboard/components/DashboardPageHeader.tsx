import { LayoutDashboard } from "lucide-react";

export function DashboardPageHeader() {
    return (
        <header className="flex items-start gap-3 border-b border-slate-200 pb-5 sm:pb-6">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700">
                <LayoutDashboard size={19} aria-hidden="true" />
            </span>
            <div className="min-w-0">
                <h1 className="text-xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
                <p className="mt-1 text-sm text-slate-600">Stock value, recent movements, and low-stock alerts.</p>
            </div>
        </header>
    );
}

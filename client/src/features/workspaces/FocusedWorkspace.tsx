import { ThemeControl } from "@/components/common/ThemeControl";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { workspaceHome } from "@/shared/constants/roles";
import { cn } from "@/lib/utils";

const accountingLinks = [
    { label: "Work queue", to: "/accounting", end: true },
    { label: "Sales and invoices", to: "/reports/transactions", end: true },
    { label: "Supplier billing", to: "/suppliers", end: false },
    { label: "Accounting report", to: "/reports/accounting", end: true },
];

export default function FocusedWorkspace() {
    const user = useAuthStore((state) => state.user);
    return (
        <div className="min-h-dvh bg-background">
            <header className="border-b border-border bg-card">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    <Link to={workspaceHome(user?.role)} className="font-semibold text-link">GroceryPro</Link>
                    <div className="flex items-center gap-3"><ThemeControl /><Link to="/me" className="text-sm text-foreground hover:underline">My account</Link></div>
                </div>
                {user?.role === "accountant" && (
                    <nav aria-label="Accounting workspace" className="border-t border-border">
                        <div className="mx-auto flex max-w-6xl flex-wrap gap-1 px-4 py-2 sm:px-6">
                            {accountingLinks.map(({ label, to, end }) => (
                                <NavLink key={to} to={to} end={end} className={({ isActive }) => cn(
                                    "inline-flex min-h-10 items-center rounded-md px-3 text-sm font-medium",
                                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                )}>{label}</NavLink>
                            ))}
                        </div>
                    </nav>
                )}
            </header>
            <Outlet />
        </div>
    );
}

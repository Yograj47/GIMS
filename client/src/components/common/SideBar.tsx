import { BarChart3, Box, LayoutDashboard, Settings, Truck, Users, ArrowLeftRight, ShoppingBag } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

const navigation = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, roles: ["admin", "owner", "staff"] },
    { label: "Products", to: "/products", icon: Box, roles: ["admin", "owner", "staff"] },
    { label: "Suppliers", to: "/suppliers", icon: Truck, roles: ["admin", "owner", "staff"] },
    { label: "Stock movements", to: "/stock-movements", icon: ArrowLeftRight, roles: ["admin", "owner", "staff"] },
    { label: "Checkout orders", to: "/stock-movements/orders", icon: ShoppingBag, roles: ["admin", "staff"] },
    { label: "Reports", to: "/reports", icon: BarChart3, roles: ["admin", "owner", "staff"] },
    { label: "Users", to: "/users", icon: Users, roles: ["admin", "owner"] },
    { label: "Settings", to: "/settings", icon: Settings, roles: ["admin", "owner"] },
];

export function WorkspaceNavigation({ compact = false, onNavigate }: {
    compact?: boolean;
    onNavigate?: () => void;
}) {
    const role = useAuthStore((state) => state.user?.role);

    return (
        <nav aria-label="Workspace" className={compact ? "grid grid-cols-2 gap-1 sm:grid-cols-4" : "space-y-1"}>
            {navigation.filter((item) => role && item.roles.includes(role)).map(({ label, to, icon: Icon }) => (
                <NavLink key={to} to={to} end={to === "/stock-movements" || to === "/reports"} title={label} onClick={onNavigate}
                    className={({ isActive }) => cn(
                        "flex min-h-11 min-w-0 items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-brand-600 xl:gap-3 xl:px-3",
                        isActive ? "bg-brand-100 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                        !compact && "lg:max-xl:justify-center",
                    )}>
                    <Icon size={19} aria-hidden="true" className="shrink-0" />
                    <span className={compact ? "break-words" : "lg:max-xl:sr-only"}>{label}</span>
                </NavLink>
            ))}
        </nav>
    );
}

import { BarChart3, Box, LayoutDashboard, Settings, Truck, Users, ArrowLeftRight, ShoppingBag, ContactRound, ClipboardList } from "lucide-react";

export const managementLinks = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, roles: ["admin", "owner"] },
    { label: "Products", to: "/products", icon: Box, roles: ["admin", "owner"] },
    { label: "Suppliers", to: "/suppliers", icon: Truck, roles: ["admin", "owner"] },
    { label: "Stock movements", to: "/stock-movements", icon: ArrowLeftRight, roles: ["admin", "owner"] },
    { label: "Customers", to: "/staff/customers", icon: ContactRound, roles: ["admin"] },
    { label: "Online orders", to: "/management/online-orders", icon: ShoppingBag, roles: ["admin", "owner"] },
    { label: "Active orders", to: "/stock-movements/orders", icon: ClipboardList, roles: ["admin"] },
    { label: "Reports", to: "/reports", icon: BarChart3, roles: ["admin", "owner"] },
    { label: "System log", to: "/reports/activity", icon: ClipboardList, roles: ["admin"] },
    { label: "Users", to: "/users", icon: Users, roles: ["admin"] },
    { label: "Settings", to: "/settings", icon: Settings, roles: ["admin", "owner"] },
];

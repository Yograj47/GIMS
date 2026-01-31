import {
    LayoutDashboard,
    Box,
    Truck,
    ArrowLeftRight,
    Bell,
    ClipboardList,
    BarChart3,
    Users,
    Settings,
    LogOut,
} from "lucide-react"

type MenuItem = {
    label: string
    icon: React.ElementType
    href: string
}

type MenuSection = {
    title: string
    items: MenuItem[]
}

const menuSections: MenuSection[] = [
    {
        title: "Main",
        items: [
            { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
            { label: "Products", icon: Box, href: "/products" },
            { label: "Suppliers", icon: Truck, href: "/suppliers" },
            { label: "Stock Movement", icon: ArrowLeftRight, href: "/stock" },
        ],
    },
    {
        title: "Analytics",
        items: [
            { label: "Alerts", icon: Bell, href: "/alerts" },
            { label: "Activity Logs", icon: ClipboardList, href: "/logs" },
            { label: "Reports", icon: BarChart3, href: "/reports" },
        ],
    },
    {
        title: "Settings",
        items: [
            { label: "User", icon: Users, href: "/users" },
            { label: "System Preferences", icon: Settings, href: "/settings" },
        ],
    },
]

import { NavLink } from "react-router-dom"; // Essential for SPA behavior
import { cn } from "@/lib/utils"; // Shadcn utility for cleaner classes

function Sidebar() {
    return (
        <aside className="flex h-screen w-64 flex-col border-r bg-white px-4 py-3 shrink-0">
            {/* Header */}
            <div className="mb-8 flex items-center gap-3 px-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100">
                    <Box className="w-5 h-5" />
                </div>
                <div className="leading-tight">
                    <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                        Grocery<span className="text-blue-600">Pro</span>
                    </h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        v1.0 Admin
                    </p>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 space-y-6 overflow-y-auto custom-scrollbar">
                {menuSections.map((section) => (
                    <div key={section.title}>
                        <h2 className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                            {section.title}
                        </h2>
                        <ul className="space-y-1">
                            {section.items.map((item) => (
                                <li key={item.label}>
                                    <NavLink
                                        to={item.href}
                                        className={({ isActive }) => cn(
                                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                            isActive 
                                                ? "bg-blue-50 text-blue-600 shadow-sm" 
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4 shrink-0" />
                                        {item.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-100">
                <button className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <LogOut className="h-4 w-4" />
                    Logout Account
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;

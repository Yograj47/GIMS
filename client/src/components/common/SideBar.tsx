import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

import {
    LayoutDashboard,
    Box,
    Truck,
    ArrowLeftRight,
    Bell,
    BarChart3,
    Users,
    Settings,
    PanelLeftClose,
    PanelLeftOpen
} from "lucide-react";
import { useAuthStore } from "@/store/useAuth";

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const location = useLocation();
    const { user } = useAuthStore();
    const [screen, setScreen] = useState<"desktop" | "tablet" | "mobile">("desktop");

    useEffect(() => {
        const update = () => {
            const w = window.innerWidth;
            if (w < 768) setScreen("mobile");
            else if (w < 1024) setScreen("tablet");
            else setScreen("desktop");
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    const collapsed = screen === "desktop" ? !isOpen : true;

    const menu = [
        { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard", roles: ['admin', 'owner', 'staff'] },
        { name: "Products", icon: <Box size={20} />, path: "/products", roles: ['admin', 'owner', 'staff'] },
        { name: "Suppliers", icon: <Truck size={20} />, path: "/suppliers", roles: ['admin', 'owner'] },
        { name: "Movement", icon: <ArrowLeftRight size={20} />, path: "/stock-movements", roles: ['admin', 'staff'] },
        { name: "Alerts", icon: <Bell size={20} />, path: "/alerts", roles: ['admin', 'staff'] },
        { name: "Reports", icon: <BarChart3 size={20} />, path: "/reports", roles: ['admin', 'owner', 'staff'] },
        { name: "Users", icon: <Users size={20} />, path: "/users", roles: ['admin'] },
        { name: "Settings", icon: <Settings size={20} />, path: "/settings", roles: ['admin', 'owner'] },
    ];

    const filteredNavigation = menu.filter(item =>
        item.roles.includes(user?.role.toLowerCase() || "")
    );

    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-500 overflow-x-hidden",
                "bg-[#0f172a] text-slate-400 border-r border-white/5",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* BRANDING SECTION */}
            <div className="h-20 flex items-center px-6 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Box className="text-white w-5 h-5" />
                    </div>
                    {!collapsed && (
                        <span className="text-white font-black tracking-tighter text-lg uppercase animate-in fade-in slide-in-from-left-2">
                            Grocery<span className="text-blue-500">Pro</span>
                        </span>
                    )}
                </div>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 px-4 space-y-2">
                {filteredNavigation.map((item) => {
                    const active = location.pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={cn(
                                "group relative flex items-center gap-4 p-2 rounded-2xl transition-all duration-300",
                                active ? "bg-blue-600/10 text-blue-400" : "hover:bg-white/5 hover:text-slate-200"
                            )}
                        >
                            {/* Glow Line for Active */}
                            {active && (
                                <div className="absolute -left-4 w-1.5 h-6 bg-blue-500 rounded-r-full shadow-[4px_0_15px_rgba(59,130,246,0.8)]" />
                            )}

                            <div className={cn(
                                "p-2.5 rounded-xl transition-all duration-300 shrink-0",
                                active ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-slate-800/50 group-hover:bg-slate-800"
                            )}>
                                {item.icon}
                            </div>

                            {!collapsed && (
                                <span className={cn(
                                    "text-sm font-bold tracking-tight",
                                    active ? "text-white" : "group-hover:text-white"
                                )}>
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* TOGGLE BUTTON AT BOTTOM */}
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={onToggle}
                    className="w-full h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all"
                >
                    {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                </button>
            </div>
        </aside>
    );
}
export default Sidebar;

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

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const location = useLocation();
    const iconStyle = "h-6 w-6 shrink-0";

    const [screen, setScreen] = useState<"desktop" | "tablet" | "mobile">("desktop");

    // ---------- Screen Detection ----------
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

    // ---------- Collapse Rules ----------
    const collapsed = screen === "desktop" ? !isOpen : true;

    // ---------- Visibility Rules ----------
    const showToggle = screen === "desktop";
    const showLogo = screen !== "desktop" || !collapsed;
    const showLabel = screen === "desktop" && !collapsed;

    // ---------- Menu ----------
    const menu = [
        { name: "Dashboard", icon: <LayoutDashboard className={iconStyle} />, path: "/dashboard" },
        { name: "Products", icon: <Box className={iconStyle} />, path: "/products" },
        { name: "Suppliers", icon: <Truck className={iconStyle} />, path: "/suppliers" },
        { name: "Stock Movement", icon: <ArrowLeftRight className={iconStyle} />, path: "/stock-movements" },
        { name: "Alerts", icon: <Bell className={iconStyle} />, path: "/alerts" },
        { name: "Reports", icon: <BarChart3 className={iconStyle} />, path: "/reports" },
        { name: "Users", icon: <Users className={iconStyle} />, path: "/users" },
        { name: "Settings", icon: <Settings className={iconStyle} />, path: "/settings" },
    ];

    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-50 flex flex-col bg-[#24303f] text-white transition-all duration-300 overflow-x-hidden",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* ---------- Header ---------- */}
            <div
                className={cn(
                    "flex items-center h-16 border-b border-slate-700/50",
                    showLogo ? "justify-between px-4" : "justify-center"
                )}
            >
                {showLogo && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 text-white">
                            <Box className="w-5 h-5" />
                        </div>

                        {showLabel && (
                            <h1 className="text-lg font-bold text-blue-100">
                                Grocery<span className="text-blue-400">Pro</span>
                            </h1>
                        )}
                    </div>
                )}

                {showToggle && (
                    <button
                        onClick={onToggle}
                        className="p-1 hover:bg-slate-700 rounded"
                    >
                        {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                    </button>
                )}
            </div>

            {/* ---------- Navigation ---------- */}
            <nav className="flex-1 mt-4 flex flex-col gap-2 px-2 overflow-y-auto">
                {menu.map(item => {
                    const active = location.pathname.startsWith(item.path);

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={cn(
                                "flex items-center rounded p-2 transition-all",
                                showLabel ? "gap-4" : "justify-center",
                                active
                                    ? "bg-[#333a48] text-white border-r-4 border-blue-500"
                                    : "text-slate-400 hover:bg-[#333a48] hover:text-white"
                            )}
                        >
                            {item.icon}
                            {showLabel && <span>{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}

export default Sidebar;

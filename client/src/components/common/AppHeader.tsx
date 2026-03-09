import { useState, useRef, useEffect } from "react";
import {
    Bell,
    ChevronDown,
    Search,
    Check,
    AlertTriangle,
    PackageX,
    ExternalLink,
    Loader2
} from "lucide-react";
import { useAlerts } from "@/features/alerts/hooks/UseAlerts";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

function AppHeader() {
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const isProfilePage = location.pathname === "/me";

    // State and Hooks
    const [showNotifications, setShowNotifications] = useState(false);
    const { activeAlerts, markAsResolved, isLoading } = useAlerts();
    const alertCount = activeAlerts.length;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleResolve = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); 
        await markAsResolved(id);
    };

    console.log("This is form sidebar:", activeAlerts);
    
    return (
        <header className="w-full h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-50">
            {/* Left: Branch Info */}
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                    Main Branch
                </h2>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="hidden md:flex items-center bg-slate-100 px-3 py-1.5 rounded-lg text-slate-400 gap-2 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <Search size={14} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent outline-none text-sm w-32 focus:w-48 transition-all duration-300"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {/* Notification Section */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={cn(
                                "relative p-2 text-slate-500 rounded-xl transition-all group",
                                showNotifications ? "bg-blue-50 text-blue-600" : "hover:bg-slate-50"
                            )}
                        >
                            <Bell size={20} className={cn("transition-transform", showNotifications ? "scale-110" : "group-hover:rotate-12")} />

                            {alertCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[9px] font-black text-white border-2 border-white bg-rose-500 animate-in zoom-in-50">
                                    {alertCount}
                                </span>
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
                                {/* Header */}
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono">Alert Center</h3>
                                    {isLoading && <Loader2 size={12} className="animate-spin text-blue-500" />}
                                </div>

                                {/* List Body */}
                                <div className="max-h-95 overflow-y-auto">
                                    {activeAlerts.length > 0 ? (
                                        activeAlerts.map((alert) => (
                                            <div
                                                key={alert._id}
                                                className="p-4 border-b border-slate-50 hover:bg-slate-50/80 transition-colors group relative cursor-default"
                                            >
                                                <div className="flex gap-3">
                                                    <div className={cn(
                                                        "p-2 rounded-xl h-fit shrink-0",
                                                        alert.severity === 'critical' ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                                                    )}>
                                                        {alert.type === 'out-of-stock' ? <PackageX size={16} /> : <AlertTriangle size={16} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-bold text-slate-800 leading-tight wrap-break-word">
                                                            {alert.message}
                                                        </p>
                                                        <p className="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-tighter">
                                                            dayjs(alert.createdAt).fromNow();
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleResolve(e, alert._id)}
                                                        className="opacity-0 group-hover:opacity-100 p-1.5 bg-white shadow-sm border border-slate-100 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all transform hover:scale-110 h-fit"
                                                        title="Resolve Now"
                                                    >
                                                        <Check size={14} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-12 px-6 text-center">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-300">
                                                <Bell size={20} />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                                                All Systems Clear<br />No Active Alerts
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <button
                                    onClick={() => { navigate('/alerts'); setShowNotifications(false); }}
                                    className="w-full p-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 border-t border-slate-100 group/footer"
                                >
                                    Review All Logs
                                    <ExternalLink size={12} className="group-hover/footer:translate-x-0.5 group-hover/footer:-translate-y-0.5 transition-transform" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="h-6 w-px bg-slate-200 mx-2"></div>

                    <Link
                        to="/me"
                        className={cn(
                            "flex items-center gap-3 p-1 pr-3 rounded-full transition-all group shrink-0",
                            isProfilePage
                                ? "bg-blue-50 ring-1 ring-blue-100"
                                : "hover:bg-slate-50"
                        )}
                    >
                        {/* Avatar Circle */}
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md transition-all",
                            "bg-linear-to-tr from-blue-600 to-indigo-500",
                            "shadow-blue-100 group-hover:shadow-blue-200 group-hover:scale-105"
                        )}>
                            YR
                        </div>

                        {/* User Text */}
                        <div className="hidden sm:flex flex-col items-start leading-none">
                            <span className={cn(
                                "text-xs font-bold transition-colors",
                                isProfilePage ? "text-blue-600" : "text-slate-900 group-hover:text-blue-600"
                            )}>
                                Yograj Rijal
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                                Super Admin
                            </span>
                        </div>

                        {/* Indicator */}
                        <ChevronDown
                            size={14}
                            className={cn(
                                "transition-transform duration-300",
                                isProfilePage ? "text-blue-500 rotate-180" : "text-slate-400 group-hover:translate-y-0.5"
                            )}
                        />
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default AppHeader;
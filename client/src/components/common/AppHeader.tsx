import { useState, useRef, useEffect } from "react";
import {
    Bell,
    Check,
    AlertTriangle,
    PackageX,
    ExternalLink,
    Loader2
} from "lucide-react";
import { useAlerts } from "@/features/alerts/hooks/UseAlerts";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useGlobalStore } from "@/store/globalStore";
import { useAuthStore } from "@/store/authStore";
dayjs.extend(relativeTime);

function AppHeader() {
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const { activeAlerts, fetchActiveAlerts, isLoading, acknowledgeAlert } = useAlerts();
    const { fetchSettings, settings } = useGlobalStore();
    const { user } = useAuthStore();

    useEffect(() => {
        fetchActiveAlerts();
        if (!settings) {
            fetchSettings();
        }
        const interval = setInterval(() => fetchActiveAlerts(), 60000);
        return () => clearInterval(interval);
    }, [fetchActiveAlerts, fetchSettings, settings]);


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
        await acknowledgeAlert(id);
    };

    return (
        <header className="w-full h-16 flex items-center justify-between px-8">
            {/* Left: Branch Status Chip */}
            <div className="flex items-center gap-3 bg-white border border-slate-400 py-1.5 px-4 rounded-full">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.15em]">
                    {settings?.storeName || "Main Hub"}
                </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={cn(
                            "relative p-2.5 rounded-xl transition-all",
                            showNotifications ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:bg-slate-100"
                        )}
                    >
                        <Bell size={20} />
                        {activeAlerts.filter(a => !a.acknowledged).length > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 border-2 border-white" />
                        )}
                    </button>

                    {/* Dropdown Menu */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
                            {/* Header */}
                            <div className="p-4 border-b border-slate-300 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono">Alert Center</h3>
                                {isLoading && <Loader2 size={12} className="animate-spin text-blue-500" />}
                            </div>

                            {/* List Body */}
                            <div className="max-h-95 overflow-y-auto">
                                {activeAlerts.length > 0 ? (
                                    activeAlerts.map((alert) => (
                                        <div
                                            key={alert._id}
                                            className={cn(
                                                "p-4 border-b border-slate-300 hover:bg-slate-50/80 transition-colors group relative cursor-default",
                                                alert.acknowledged && "opacity-50 bg-amber-50/30" 
                                            )}
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
                                                        {dayjs(alert.createdAt).fromNow()}
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

                <div className="h-8 w-px bg-slate-300 mx-1" />

                {/* Profile Link */}
                <Link to="/me" className="flex items-center gap-3 pl-2 group">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-slate-900 leading-none">{user?.name}</p>
                        <p className="text-[9px] font-bold text-blue-600 uppercase mt-1 tracking-tighter">{user?.role}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                        {user?.name[0]}
                    </div>
                </Link>
            </div>
        </header>
    );
}
export default AppHeader;
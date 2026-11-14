import { ThemeControl } from "@/components/common/ThemeControl";
import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import {
    Bell,
    Check,
    AlertTriangle,
    PackageX,
    ExternalLink,
    Loader2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useGlobalStore } from "@/store/globalStore";
import { useAuthStore } from "@/store/authStore";
import { useAlerts } from "@/features/alerts/hooks/useAlerts";
import type { AlertData } from "@/types/alert";
dayjs.extend(relativeTime);

function AppHeader({ navigationControl }: { navigationControl?: ReactNode }) {
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const {
        activeAlerts,
        isLoading,
        acknowledgeAlert
    } = useAlerts(); const { fetchSettings, settings } = useGlobalStore();
    const { user } = useAuthStore();

    useEffect(() => {
        if (!settings) {
            fetchSettings();
        }
    }, [
        fetchSettings,
        settings
    ]);

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

    const unreadCount =
        activeAlerts.filter(
            (a: AlertData) => !a.acknowledged
        ).length;

    return (
        <header className="relative flex min-h-16 w-full items-center justify-between gap-2 px-3 sm:px-6 xl:px-8">
            <div className="flex min-w-0 items-center gap-2">
                {navigationControl}
                <span className="truncate text-sm font-semibold text-foreground sm:text-base">
                    {settings?.storeName || "Main Hub"}
                </span>
            </div>

            {/* Right: Actions */}
            <div className="flex shrink-0 items-center gap-1 sm:gap-3">
                <ThemeControl />
                {/* Notifications */}
                <div className="sm:relative" ref={dropdownRef}>
                    <button
                        type="button"
                        aria-label="Notifications"
                        aria-expanded={showNotifications}
                        onClick={() =>
                            setShowNotifications(
                                (prev) => !prev
                            )
                        }
                        className={cn(
                            "relative p-2.5 rounded-xl transition-all",
                            showNotifications ? "bg-brand-50 text-link" : "text-subtle-foreground hover:bg-secondary"
                        )}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 border-2 border-white" />
                        )}
                    </button>

                    {/* Dropdown Menu */}
                    {showNotifications && (
                        <div className="absolute inset-x-3 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-xl sm:inset-x-auto sm:right-0 sm:w-80">
                            {/* Header */}
                            <div className="p-4 border-b border-input flex justify-between items-center bg-muted/50">
                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground font-mono">Alert Center</h3>
                                {isLoading && <Loader2 size={12} className="animate-spin text-brand-500" />}
                            </div>

                            {/* List Body */}
                            <div className="max-h-[55dvh] overflow-y-auto">
                                {activeAlerts.length > 0 ? (
                                    activeAlerts.map((alert : AlertData) => (
                                        <div
                                            key={alert._id}
                                            className={cn(
                                                "p-4 border-b border-input hover:bg-muted/80 transition-colors group relative cursor-default",
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
                                                    <p className="text-[11px] font-bold text-foreground leading-tight wrap-break-word">
                                                        {alert.message}
                                                    </p>
                                                    <p className="text-[9px] text-subtle-foreground mt-1 font-bold uppercase tracking-tighter">
                                                        {dayjs(alert.createdAt).fromNow()}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => handleResolve(e, alert._id)}
                                                    className="p-2 bg-card shadow-sm border border-border text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white h-fit"
                                                    title="Resolve Now"
                                                >
                                                    <Check size={14} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 px-6 text-center">
                                        <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-300">
                                            <Bell size={20} />
                                        </div>
                                        <p className="text-[10px] font-black text-subtle-foreground uppercase tracking-widest leading-relaxed">
                                            All Systems Clear<br />No Active Alerts
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
                                {[
                                    { level: "low", label: "Low Stock" },
                                    { level: "out", label: "Out of Stock" },
                                ].map(({ level, label }) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => { navigate(`/reports/stock?level=${level}`); setShowNotifications(false); }}
                                        className="flex min-h-11 items-center justify-center gap-2 px-2 text-xs font-medium text-foreground hover:bg-muted hover:text-link"
                                    >
                                        {label}
                                        <ExternalLink size={12} aria-hidden="true" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="hidden h-8 w-px bg-secondary sm:block" />

                {/* Profile Link */}
                <Link to="/me" aria-label="Your profile" className="flex min-h-11 items-center gap-2 group">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-foreground leading-none">{user?.name}</p>
                        <p className="text-[9px] font-bold text-link uppercase mt-1 tracking-tighter">{user?.role}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-brand-600 to-brand-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                        {user?.name?.[0] ?? "U"}
                    </div>
                </Link>
            </div>
        </header>
    );
}
export default AppHeader;

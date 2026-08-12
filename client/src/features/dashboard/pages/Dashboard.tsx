import { useEffect, useMemo } from "react";
import { Package, AlertCircle, Activity, Plus, ArrowUpRight, Truck, CheckCircle2, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Our New Components
import StatCard from "../components/StatCard";
import ActionTile from "../components/ActionTile";
import ChartSection from "../components/ChartSection";
import LiveFeedCard from "../components/LiveFeedCard";
import AlertCard from "../components/AlertCard";
import { useActivityLogs } from "@/features/activityLogs/hooks/useActivityLogs";
import { chartData, chartOptions } from "@/lib/dashboardCharts";
import { useAlerts } from "@/features/alerts/hooks/useAlerts";
import { useAnalytics } from "../hooks/useAnalystics";
import { useAuthStore } from "@/store/authStore";

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { logs, fetchRecentLogs } = useActivityLogs();
    const { alerts, acknowledgeAlert } = useAlerts();
    const { weeklyStats, fetchWeeklyStats, summary, fetchSummary } = useAnalytics();

    useEffect(() => {
        const syncDashboard = async () => {
            const promises = [
                fetchWeeklyStats(),
                fetchSummary(),
            ];

            if (user?.role === 'admin' || user?.role === 'owner') {
                promises.push(fetchRecentLogs(5));
            }

            await Promise.all(promises);
        };
        syncDashboard();
    }, [fetchWeeklyStats, fetchSummary, fetchRecentLogs, user]);

    const dynamicData = useMemo(() => {
        if (!weeklyStats || weeklyStats.length === 0) {
            return chartData([], [], ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
        }
        const labels = [...new Set(weeklyStats.map(s => s._id.day))];
        const stockIn = labels.map(day => weeklyStats.find(s => s._id.day === day && s._id.type === 'IN')?.totalQty || 0);
        const stockOut = labels.map(day => weeklyStats.find(s => s._id.day === day && s._id.type === 'OUT')?.totalQty || 0);
        return chartData(stockIn, stockOut, labels);
    }, [weeklyStats]);

    const criticalAlert = useMemo(
        () =>
            alerts.find(
                (a) =>
                    !a.acknowledged &&
                    a.severity === "critical"
            ) ?? null,
        [alerts]
    );

    return (
        <div className="h-full space-y-8 animate-in fade-in duration-700">

            {/* 1. Page Header */}
            <div className="flex items-center justify-between border-b border-slate-300 pb-8">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-100">
                        <LayoutDashboard size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
                            System Overview
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                            Real-time Inventory Analytics & Control
                        </p>
                    </div>
                </div>
                <div className="hidden md:block text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network Status</p>
                    <div className="flex items-center gap-2 justify-end mt-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-slate-700 uppercase">Live Sync</span>
                    </div>
                </div>
            </div>

            {/* 2. Metrics Row - Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Stock Value"
                    value={summary ? `Rs ${summary.stockValue.toLocaleString()}` : 'Rs 0'}
                    trend="+5.4% UP"
                    trendUp={true}
                    icon={<Package size={20} />}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                    desc="Total inventory valuation"
                />
                <StatCard
                    title="Low Items"
                    value={summary?.lowItems ?? '0'}
                    trend="CRITICAL"
                    trendUp={false}
                    icon={<AlertCircle size={20} />}
                    color="text-rose-600"
                    bgColor="bg-rose-50"
                    desc="Items below minimum stock"
                />
                <StatCard
                    title="Today's Flow"
                    value={summary?.todayFlow?.value ?? '0'}
                    trend={summary ? `${summary.todayFlow.trend}% ${summary.todayFlow.status}` : '0% UP'}
                    trendUp={summary?.todayFlow?.status === 'UP'}
                    icon={<Activity size={20} />}
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
                    desc="Movement vs yesterday"
                />
            </div>

            {/* 3. Main Body - 3/4 Chart, 1/4 Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
                {/* Primary Analytics Surface */}
                <div className="lg:col-span-9 space-y-8">
                    <div className="bg-white border border-slate-300 rounded-sm shadow-sm p-6">
                        <ChartSection data={dynamicData} options={chartOptions} />
                    </div>

                    {/* Secondary Data Surface */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <LiveFeedCard logs={logs} onViewAll={() => navigate('/reports/activity')} />

                        {criticalAlert ? (
                            <AlertCard
                                productName={criticalAlert.productId.name}
                                remainingQty={`${criticalAlert.snapshotValue} ${criticalAlert.productId.unitId?.name ?? ""  }`} 
                                    onAction={() => acknowledgeAlert(criticalAlert._id)}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center border border-slate-200 rounded-sm bg-slate-50/30 p-8 text-center">
                                <CheckCircle2 size={32} className="text-emerald-500/30 mb-4" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Systems Nominal</p>
                                <p className="text-[9px] font-bold text-slate-300 uppercase mt-2">No critical stock alerts</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Command Center */}
                <div className="lg:col-span-3">
                    <div className="sticky top-8 space-y-6">
                        <div className="border-l-4 border-blue-600 pl-4 py-1">
                            <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Quick Actions</h3>
                            <p className="text-[9px] font-bold text-slate-600 uppercase">Command Center</p>
                        </div>

                        <div className="space-y-3">
                            <ActionTile icon={<Plus size={18} />} label="New Product" color="bg-blue-600" onClick={() => navigate('/products/add')} />
                            <ActionTile icon={<ArrowUpRight size={18} />} label="Record Sale" color="bg-emerald-500" onClick={() => navigate('/stock-movements/form?mode=in')} />
                            <ActionTile icon={<Truck size={18} />} label="Suppliers" color="bg-slate-900" onClick={() => navigate('/suppliers')} />
                        </div>

                        {/* Dashboard Tip/Info Card */}
                        <div className="p-6 bg-slate-600 rounded-sm text-white shadow-xl shadow-slate-200 mt-10 relative overflow-hidden">
                            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] mb-3 text-white">Pro Analysis</h4>
                            <p className="text-[11px] font-medium text-slate-200 leading-relaxed">
                                Click on any <span className="text-white font-bold">"Low Items"</span> alert to see detailed movement history and projected depletion dates.
                            </p>
                            {/* Decorative background element */}
                            <div className="absolute -right-4 -top-4 h-16 w-16 bg-gray-400 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
import { useEffect, useMemo, useState } from "react";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { Package, AlertCircle, Activity, Plus, ArrowUpRight, Truck, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Our New Components
import StatCard from "../components/StatCard";
import ActionTile from "../components/ActionTile";
import ChartSection from "../components/ChartSection";
import LiveFeedCard from "../components/LiveFeedCard";
import AlertCard from "../components/AlertCard";
import { DashboardPageHeader } from "../components/DashboardPageHeader";
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
    const [isInitialLoading, setInitialLoading] = useState(true);
    const role = user?.role;

    useEffect(() => {
        let active = true;
        const syncDashboard = async () => {
            const promises = [
                fetchWeeklyStats(),
                fetchSummary(),
            ];

            if (role === 'admin' || role === 'owner') {
                promises.push(fetchRecentLogs(5));
            }

            await Promise.allSettled(promises);
            if (active) setInitialLoading(false);
        };
        void syncDashboard();
        return () => { active = false; };
    }, [fetchWeeklyStats, fetchSummary, fetchRecentLogs, role]);

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

    if (isInitialLoading) return <LoadingSkeleton layout="dashboard" label="Loading dashboard" />;

    return (
        <div className="space-y-5 sm:space-y-7">

            <DashboardPageHeader />

            {/* 2. Metrics Row - Stat Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <StatCard
                    title="Stock Value"
                    value={summary ? `Rs ${summary.stockValue.toLocaleString()}` : 'Rs 0'}
                    icon={<Package size={20} />}
                    color="text-brand-600"
                    bgColor="bg-brand-50"
                    desc="Total inventory valuation"
                />
                <StatCard
                    title="Low Items"
                    value={summary?.lowItems ?? '0'}
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
            <div className="grid min-w-0 gap-5 pb-6 xl:grid-cols-[minmax(0,1fr)_minmax(12rem,17rem)]">
                {/* Primary Analytics Surface */}
                <div className="min-w-0 space-y-5">
                    <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-6">
                        <ChartSection data={dynamicData} options={chartOptions} />
                    </div>

                    {/* Secondary Data Surface */}
                    <div className="grid gap-4 lg:grid-cols-2">
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
                <section className="row-start-1 space-y-3 self-start xl:col-start-2 xl:sticky xl:top-21">
                    <h2 className="text-sm font-semibold">Quick actions</h2>
                    <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                        {role !== "staff" && <ActionTile icon={<Plus size={18} />} label="New Product" color="bg-brand-600" onClick={() => navigate('/products/add')} />}
                        {role !== "owner" && <ActionTile icon={<ArrowUpRight size={18} />} label="Record Sale" color="bg-brand-600" onClick={() => navigate('/stock-movements/sale')} />}
                        <ActionTile icon={<Truck size={18} />} label="Suppliers" color="bg-slate-800" onClick={() => navigate('/suppliers')} />
                    </div>
                </section>
            </div>
        </div>
    );
}

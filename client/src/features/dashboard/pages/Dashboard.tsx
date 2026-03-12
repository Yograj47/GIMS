import { useEffect, useMemo } from "react";
import { Package, AlertCircle, Activity, Plus, ArrowUpRight, Truck, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Our New Components
import StatCard from "../components/StatCard";
import ActionTile from "../components/ActionTile";
import ChartSection from "../components/ChartSection";
import LiveFeedCard from "../components/LiveFeedCard";
import AlertCard from "../components/AlertCard";
import { useActivityLogs } from "@/features/activityLogs/hooks/useActivityLogs";
import { chartData, chartOptions } from "@/lib/dashboardCharts";
import { useAlerts } from "@/features/alerts/hooks/UseAlerts";
import { useAnalytics } from "../hooks/useAnalystics";


export default function Dashboard() {
    const navigate = useNavigate();
    const { logs, fetchRecentLogs } = useActivityLogs();
    const { activeAlerts, fetchActiveAlerts, markAsResolved, isLoading: alertLoading } = useAlerts();
    const { weeklyStats, fetchWeeklyStats, summary, fetchSummary } = useAnalytics();

    useEffect(() => {
        const syncDashboard = async () => {
            await Promise.all([
                fetchActiveAlerts(),
                fetchWeeklyStats(),
                fetchSummary(),
                fetchRecentLogs(5)
            ]);
        };
        syncDashboard();
    }, [fetchActiveAlerts, fetchWeeklyStats, fetchSummary, fetchRecentLogs]);

    const dynamicData = useMemo(() => {
        if (!weeklyStats || weeklyStats.length === 0) {
            return chartData([], [], ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
        }

        const labels = [...new Set(weeklyStats.map(s => s._id.day))];
        const stockIn = labels.map(day =>
            weeklyStats.find(s => s._id.day === day && s._id.type === 'IN')?.totalQty || 0
        );
        const stockOut = labels.map(day =>
            weeklyStats.find(s => s._id.day === day && s._id.type === 'OUT')?.totalQty || 0
        );

        return chartData(stockIn, stockOut, labels);
    }, [weeklyStats]); // Only re-runs if weeklyStats changes


    const handleResolve = async (id: string) => {
        await markAsResolved(id);
    };

    const criticalAlert = activeAlerts.length > 0 ? activeAlerts[0] : null;

    return (
        // Added 'will-change-transform' to help browser GPU rendering during animation
        <div className="min-h-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 will-change-transform">

            {/* 2. Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Stock Value"
                    // Use optional chaining with fallback to avoid layout shift
                    value={summary ? `Rs ${summary.stockValue.toLocaleString()}` : 'Rs 0'}
                    trend="+5.4% UP"
                    trendUp={true}
                    icon={<Package size={22} />}
                    color="text-indigo-600"
                    bgColor="bg-indigo-50"
                    desc="Total inventory valuation"
                />

                {/* ... (Repeat pattern for other cards) */}
                <StatCard
                    title="Low Items"
                    value={summary?.lowItems ?? '0'}
                    trend="CRITICAL"
                    trendUp={false}
                    icon={<AlertCircle size={22} />}
                    color="text-rose-600"
                    bgColor="bg-rose-50"
                    desc="Items below minimum stock"
                />

                <StatCard
                    title="Today's Flow"
                    value={summary?.todayFlow?.value ?? '0'}
                    trend={summary ? `${summary.todayFlow.trend}% ${summary.todayFlow.status}` : '0% UP'}
                    trendUp={summary?.todayFlow?.status === 'UP'}
                    icon={<Activity size={22} />}
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
                    desc="Outbound volume vs yesterday"
                />
            </div>

            {/* 3. Performance Analytics */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Visual Analytics Component */}
                <ChartSection data={dynamicData} options={chartOptions} />

                {/* Action Stack */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 font-mono">
                        Command Center
                    </h3>
                    <ActionTile icon={<Plus />} label="New Product" color="bg-indigo-600" onClick={() => navigate('/products/new')} />
                    <ActionTile icon={<ArrowUpRight />} label="Record Sale" color="bg-emerald-500" onClick={() => navigate('/sales/new')} />
                    <ActionTile icon={<Truck />} label="Manage Suppliers" color="bg-slate-900" onClick={() => navigate('/suppliers')} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* Live Activity Component */}
                <LiveFeedCard
                    logs={logs}
                    onViewAll={() => navigate('/activity-logs')}
                />

                {criticalAlert ? (
                    <AlertCard
                        productName={criticalAlert.productId.name}
                        remainingQty={`${criticalAlert.snapshotValue} ${criticalAlert.productId.unitId?.name || ''}`}
                        onAction={() => handleResolve(criticalAlert._id)
                        }
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 p-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-emerald-500 mb-3">
                            <CheckCircle2 size={24} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                            {alertLoading ? "Syncing Sensors..." : "All Systems Nominal: No Active Alerts"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
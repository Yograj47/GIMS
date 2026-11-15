import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BarChart3, Bell, ClipboardList, PackagePlus, Receipt, Truck } from "lucide-react";
import { Line } from "react-chartjs-2";
import { useTheme } from "next-themes";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useActivityLogs } from "@/features/activityLogs/hooks/useActivityLogs";
import { chartData, chartOptions } from "@/lib/dashboardCharts";
import api from "@/lib/api";

type Overview = {
    days: { date: string; sales: number; purchases: number }[];
    lowStock: number;
    onlineOrders: number | null;
};

const npr = new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR" });
const dateLabel = new Intl.DateTimeFormat("en-NP", { month: "short", day: "numeric", timeZone: "UTC" });

export default function Dashboard() {
    const admin = useAuthStore((state) => state.user?.role === "admin");
    const { resolvedTheme } = useTheme();
    const { logs, fetchRecentLogs } = useActivityLogs();
    const [overview, setOverview] = useState<Overview>();
    const [failed, setFailed] = useState(false);
    const [logsFailed, setLogsFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const request = new AbortController();
        api.get<{ data: Overview }>("/analytics/store-overview", { signal: request.signal })
            .then(({ data }) => { if (!request.signal.aborted) setOverview(data.data); })
            .catch(() => { if (!request.signal.aborted) setFailed(true); });
        return () => request.abort();
    }, [attempt, admin]);

    useEffect(() => {
        if (admin) void fetchRecentLogs(5).catch(() => setLogsFailed(true));
    }, [admin, fetchRecentLogs]);

    const sales = overview?.days.reduce((sum, day) => sum + day.sales, 0) ?? 0;
    const purchases = overview?.days.reduce((sum, day) => sum + day.purchases, 0) ?? 0;
    const series = overview?.days ?? [];
    const metrics = admin ? [
        { label: "Low-stock products", value: overview?.lowStock, to: "/reports/stock?level=low", icon: Bell },
        { label: "Online orders awaiting action", value: overview?.onlineOrders, to: "/stock-movements/orders", icon: ClipboardList },
        { label: "Sales in the last 7 days", value: npr.format(sales), to: "/reports/transactions", icon: Receipt },
    ] : [
        { label: "Sales in the last 7 days", value: npr.format(sales), to: "/reports/transactions", icon: Receipt },
        { label: "Purchases received in the last 7 days", value: npr.format(purchases), to: "/stock-movements/purchase", icon: Truck },
        { label: "Low-stock products", value: overview?.lowStock, to: "/reports/stock?level=low", icon: Bell },
    ];

    return (
        <section className="space-y-4">
            <PageHeader title={admin ? "Store operations" : "Store overview"} icon={BarChart3} />
            {failed ? (
                <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
                    <p>Could not load the store overview.</p>
                    <Button variant="outline" onClick={() => { setFailed(false); setAttempt((n) => n + 1); }}>Retry</Button>
                </div>
            ) : !overview ? <LoadingSkeleton layout="dashboard" label="Loading store overview" /> : (
                <>
                    <div className="grid gap-3 sm:grid-cols-3">
                        {metrics.map(({ label, value, to, icon: Icon }) => (
                            <Link key={label} to={to} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:bg-accent">
                                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-accent text-link"><Icon className="size-4" aria-hidden="true" /></span>
                                <span className="min-w-0 flex-1"><span className="block text-sm text-muted-foreground">{label}</span><strong className="mt-0.5 block wrap-anywhere text-xl tabular-nums">{value}</strong></span>
                                <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-link" />
                            </Link>
                        ))}
                    </div>
                    <div className={admin ? "grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(17rem,0.65fr)]" : "space-y-4"}>
                        <section className="min-w-0 space-y-4 rounded-lg border border-border bg-card p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h2 className="font-semibold">Sales and purchases</h2>
                                <span className="text-sm text-muted-foreground">Last 7 days · NPR</span>
                            </div>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-chart-1" />Sales</span>
                                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-chart-2" />Purchases received</span>
                            </div>
                            <div className="h-64">
                                <Line key={resolvedTheme} role="img" aria-label="Daily sale and received purchase values"
                                    data={chartData(series.map((day) => day.sales), series.map((day) => day.purchases),
                                        series.map((day) => dateLabel.format(new Date(day.date))), ["Sales", "Purchases received"])}
                                    options={chartOptions()} />
                            </div>
                        </section>
                        {admin && (
                            <section className="rounded-lg border border-border bg-card">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-4">
                                    <h2 className="font-semibold">Recent system activity</h2>
                                    <Link to="/reports/activity" className="text-sm text-link hover:underline">System log</Link>
                                </div>
                                {logs.length === 0 ? <p className="p-4 text-sm text-muted-foreground">{logsFailed ? "Could not load recent activity." : "No recent activity."}</p> : (
                                    <ul className="divide-y divide-border">
                                        {logs.map((log) => (
                                            <li key={log._id} className="px-4 py-3 text-sm">
                                                <p className="wrap-anywhere font-medium">{log.message}</p>
                                                <p className="mt-1 text-xs text-muted-foreground">{log.performedBy?.name ?? "Unknown account"} · {new Date(log.createdAt).toLocaleString()}</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        )}
                    </div>
                </>
            )}
            <nav aria-label="Quick actions" className="flex flex-wrap gap-2">
                <Button asChild variant="outline"><Link to="/stock-movements/purchase"><Truck aria-hidden="true" /> Receive delivery</Link></Button>
                <Button asChild variant="outline"><Link to="/products/add"><PackagePlus aria-hidden="true" /> Add product</Link></Button>
                <Button asChild variant="outline"><Link to="/reports/accounting"><BarChart3 aria-hidden="true" /> Accounting report</Link></Button>
            </nav>
        </section>
    );
}

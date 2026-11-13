import { useEffect, useState } from "react";
import { ShieldAlert, Activity } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";
import { getAlertColumns } from "../components/AlertColumns";
import { useAlerts } from "../hooks/useAlerts";

export default function SystemAlerts() {
    const {
        alerts,
        meta,
        isLoading,
        fetchAllAlerts,
        acknowledgeAlert,
    } = useAlerts();

    const activeCount = alerts.filter((alert) => !alert.acknowledged && !alert.resolved).length;

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    useEffect(() => {
        fetchAllAlerts(
            pagination.pageIndex + 1,
            pagination.pageSize
        );
    }, [
        fetchAllAlerts,
        pagination.pageIndex,
        pagination.pageSize,
    ]);
    return (
        <section id="system-alerts" aria-labelledby="system-alerts-heading" className="scroll-mt-28 space-y-4">

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-red-600 rounded-lg text-white shadow-lg shadow-brand-100">
                        <ShieldAlert size={20} />
                    </div>
                    <div>
                        <h2 id="system-alerts-heading" className="text-lg font-semibold text-slate-900">
                            System Alerts
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {meta?.totalItems || 0} alerts
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white border border-slate-300 px-4 py-2 rounded-sm shadow-sm">
                    <Activity size={14} className="text-rose-600 animate-pulse" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                        {activeCount} pending on this page
                    </span>
                </div>
            </div>


            <div className="bg-white border border-slate-300">
                <DataTable
                    columns={getAlertColumns(acknowledgeAlert)}
                    data={alerts}
                    isLoading={isLoading}
                    pageCount={meta?.totalPages || 0}
                    rowCount={meta?.totalItems || 0}
                    pagination={pagination}
                    setPagination={setPagination}
                />
            </div>
        </section>
    );
}

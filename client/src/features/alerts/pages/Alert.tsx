import React, { useEffect, useState } from "react";
import { ShieldAlert, Activity } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";
import { getAlertColumns } from "../components/AlertColumns";
import { useAlerts } from "../hooks/useAlerts";
import { useAlertStore } from "../store/alert.store";

const AlertPage: React.FC = () => {
    const {
        alerts,
        meta,
        isLoading,
        fetchAllAlerts,
        acknowledgeAlert,
    } = useAlerts();

    const activeCount = useAlertStore(
        (s) =>
            s.alerts.filter(
                (a) =>
                    !a.acknowledged &&
                    !a.resolved
            ).length
    );
    
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
        <div className="h-full animate-in fade-in duration-500">
            <div className="max-w-400 mx-auto space-y-6">

                {/* 1. Precision Header (Matches Products Pattern) */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-red-600 rounded-lg text-white shadow-lg shadow-blue-100">
                            <ShieldAlert size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
                                System Alerts
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {meta?.totalItems || 0} Total Logs • <span className="text-red-600 italic">Integrity Check</span>
                            </p>
                        </div>
                    </div>

                    {/* Active Issues Badge */}
                    <div className="flex items-center gap-3 bg-white border border-slate-300 px-4 py-2 rounded-sm shadow-sm">
                        <Activity size={14} className="text-rose-600 animate-pulse" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                            {activeCount} Issues Pending
                        </span>
                    </div>
                </div>


                {/* 2. The Data Table Wrapper */}
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
            </div>
        </div>
    );
};

export default AlertPage;
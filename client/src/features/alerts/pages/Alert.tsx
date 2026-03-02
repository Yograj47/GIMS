import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";
import { getAlertColumns } from "../components/AlertColumns";
import { useAlerts } from "../hooks/UseAlerts";

export default function AlertPage() {
    const {
        alerts,
        fetchAllAlerts,
        markAsResolved,
        isLoading,
        meta,
        activeCount,
        fetchActiveAlerts
    } = useAlerts();

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    // Standardized Debounced Fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAllAlerts(pagination.pageIndex + 1, pagination.pageSize);
            fetchActiveAlerts();

        }, 400);
        return () => clearTimeout(timer);
    }, [fetchAllAlerts, pagination.pageIndex, pagination.pageSize, fetchActiveAlerts]);

    return (
        <div className="w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500 min-h-0 px-1">

            {/* 1. Header Section */}
            <div className="flex items-end justify-between mb-4 shrink-0">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
                        Alerts<span className="text-rose-600">!</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                        System Integrity & Stock Monitoring
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-rose-50 border-2 border-rose-100 px-6 py-3 rounded-2xl shadow-sm">
                    <ShieldAlert className="text-rose-600" size={20} strokeWidth={3} />
                    <div className="flex flex-col">
                        <span className="text-rose-600 font-black text-lg leading-none">{activeCount}</span>
                        <span className="text-[8px] font-black uppercase text-rose-400 tracking-tighter">Active Issues</span>
                    </div>
                </div>
            </div>


            {/* 3. DataTable Section */}
            <div className="flex-1 min-h-0 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm mb-4">
                <DataTable
                    columns={getAlertColumns(markAsResolved)}
                    data={alerts}
                    isLoading={isLoading}
                    pageCount={meta?.totalPages || 0}
                    rowCount={meta?.totalItems || 0}
                    pagination={pagination}
                    setPagination={setPagination}
                />
            </div>
        </div>
    );
}
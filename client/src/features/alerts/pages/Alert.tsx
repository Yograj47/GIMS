import React, { useEffect, useState } from "react";
import { ShieldAlert, RotateCcw, Search, Activity } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from "@/components/common/DataTable";
import { getAlertColumns } from "../components/AlertColumns";
import { useAlerts } from "../hooks/UseAlerts";

const AlertPage: React.FC = () => {
    const {
        alerts,
        fetchAllAlerts,
        markAsResolved,
        isLoading,
        meta,
        activeCount,
        fetchActiveAlerts
    } = useAlerts();

    const [searchQuery, setSearchQuery] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAllAlerts(pagination.pageIndex + 1, pagination.pageSize);
            fetchActiveAlerts();
        }, 400);
        return () => clearTimeout(timer);
    }, [fetchAllAlerts, pagination.pageIndex, pagination.pageSize, fetchActiveAlerts]);

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
                                {meta?.totalItems || 0} Total Logs • <span className="text-rose-600 italic">Integrity Check</span>
                            </p>
                        </div>
                    </div>

                    {/* Active Issues Badge */}
                    <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-sm shadow-sm">
                        <Activity size={14} className="text-rose-600 animate-pulse" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                            {activeCount} Issues Pending
                        </span>
                    </div>
                </div>

                {/* 2. Precision Toolbar */}
                <div className="flex flex-col lg:flex-row gap-3">
                    <div className="relative flex-1 group">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                            size={14}
                            strokeWidth={2.5}
                        />
                        <Input
                            placeholder="Search by product name or alert message..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 bg-white border-slate-200 rounded-sm text-sm focus-visible:ring-1 focus-visible:ring-blue-500 transition-all shadow-none"
                        />
                    </div>

                    <Button
                        variant="outline"
                        disabled={!searchQuery}
                        onClick={() => setSearchQuery("")}
                        className="h-10 border-slate-200 text-slate-500 hover:bg-slate-50 rounded-sm text-[11px] font-bold uppercase"
                    >
                        <RotateCcw className="mr-2 h-3 w-3" /> Reset
                    </Button>
                </div>

                {/* 3. The Data Table Wrapper */}
                <div className="bg-white border border-slate-200 shadow-sm">
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
        </div>
    );
};

export default AlertPage;
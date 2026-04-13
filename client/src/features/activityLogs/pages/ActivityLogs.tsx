import { useEffect, useState } from "react";
import { Search, Calendar, Info, ArrowLeft } from "lucide-react";
import { useActivityLogs } from "../hooks/useActivityLogs";
import { DataTable } from "@/components/common/DataTable";
import { getActivityLogColumns } from "../components/ActivityLogColumns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/lib/debounce";

export default function ActivityLogsPage() {
    const { logs, fetchLogs, isLoading, meta } = useActivityLogs();

    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
    const navigate = useNavigate();
    const debouncedSearch = useDebounce(searchQuery, 400);

    useEffect(() => {
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, [debouncedSearch, typeFilter, startDate, endDate]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs(
                pagination.pageIndex + 1,
                pagination.pageSize,
                typeFilter,
                debouncedSearch,
                startDate,
                endDate
            );
        }, 400);
        return () => clearTimeout(timer);
    }, [fetchLogs, pagination.pageIndex, pagination.pageSize, debouncedSearch, typeFilter, startDate, endDate]);

    return (
        <div className="h-full animate-in fade-in duration-500">
            <div className="max-w-400 mx-auto space-y-6">

                {/* 1. PRECISION HEADER */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="text-slate-500 hover:text-blue-600 group"
                        >
                            <div className="w-8 h-8 rounded-sm bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
                            </div>
                        </Button>
                        <div className="p-2 bg-blue-600 rounded-sm text-white">
                            <Info size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
                                Activity Logs
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                System Audit Trail • <span className="text-blue-600 italic">Audit Mode</span>
                            </p>
                        </div>
                    </div>

                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Events</p>
                        <p className="text-xl font-black text-slate-900 tabular-nums">{meta?.totalItems || 0}</p>
                    </div>
                </div>

                {/* 2. PRECISION TOOLBAR */}
                <div className="flex flex-col lg:flex-row gap-3">
                    {/* Search Field */}
                    <div className="relative flex-1 group">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-800 group-focus-within:text-blue-600 transition-colors"
                            size={14}
                            strokeWidth={2.5}
                        />
                        <Input
                            placeholder="Search by message or operator..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 bg-white border-slate-200 rounded-sm text-sm focus-visible:ring-1
                             focus-visible:ring-blue-500 transition-all shadow-none placeholder:text-slate-300 font-medium"
                        />
                    </div>

                    {/* Date Range Group */}
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-sm px-2">
                        <Calendar size={12} className="text-slate-400" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent border-none p-1 text-[10px] font-black outline-none text-slate-600"
                        />
                        <span className="text-slate-300 text-[10px]">to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent border-none p-1 text-[10px] font-black outline-none text-slate-600"
                        />
                    </div>

                    {/* Module Filter */}
                    <div className="relative min-w-40">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full h-10 px-4 bg-white border border-slate-200 rounded-sm text-[11px] font-bold uppercase tracking-tight text-slate-600 outline-none hover:border-slate-300 focus:border-blue-500 appearance-none cursor-pointer transition-all"
                        >
                            <option value="">All Modules</option>
                            <option value="INVENTORY">Inventory</option>
                            <option value="FINANCE">Finance</option>
                            <option value="AUTH">Security</option>
                        </select>
                    </div>
                </div>

                {/* 3. DATA TABLE WRAPPER */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden">
                    <DataTable
                        columns={getActivityLogColumns()}
                        data={logs}
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
}
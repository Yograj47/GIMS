import { useEffect, useState } from "react";
import { Search, Calendar } from "lucide-react";
import { useActivityLogs } from "../hooks/useActivityLogs";
import { DataTable } from "@/components/common/DataTable";
import { getActivityLogColumns } from "../components/ActivityLogColumns";
export default function ActivityLogsPage() {
    const { logs, fetchLogs, isLoading, meta } = useActivityLogs();
    
    // State for all filters
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });

    // Single useEffect to handle all filter changes
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs(
                pagination.pageIndex + 1, 
                pagination.pageSize, 
                typeFilter, 
                searchQuery,
                startDate,
                endDate
            );
        }, 400);
        return () => clearTimeout(timer);
    }, [fetchLogs, pagination.pageIndex, pagination.pageSize, searchQuery, typeFilter, startDate, endDate]);

    return (
        <div className="w-full h-full flex flex-col space-y-4 px-1">
            {/* ... Header ... */}

            <div className="flex flex-wrap gap-3 shrink-0">
                {/* Search Bar */}
                <div className="flex-1 min-w-75 bg-white border-2 border-slate-200 focus-within:border-slate-800 rounded-2xl p-3 flex items-center gap-4 transition-all">
                    <Search size={18} className="text-slate-400" strokeWidth={3} />
                    <input
                        type="text"
                        placeholder="SEARCH AUDIT LOGS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none font-black text-xs uppercase tracking-widest text-slate-800"
                    />
                </div>

                {/* Date Filters Group */}
                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-200">
                    <div className="flex items-center gap-2 px-3">
                        <Calendar size={14} className="text-slate-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase">Range:</span>
                    </div>
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-white border-none rounded-xl px-3 py-1.5 text-[10px] font-black uppercase outline-none focus:ring-2 ring-slate-800"
                    />
                    <span className="text-slate-400 font-bold text-xs">to</span>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-white border-none rounded-xl px-3 py-1.5 text-[10px] font-black uppercase outline-none focus:ring-2 ring-slate-800"
                    />
                    {(startDate || endDate) && (
                        <button 
                            onClick={() => { setStartDate(""); setEndDate(""); }}
                            className="px-3 text-[10px] font-black text-rose-500 hover:text-rose-700 underline"
                        >
                            CLEAR
                        </button>
                    )}
                </div>

                {/* Module Selector */}
                <select 
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-40 bg-white border-2 border-slate-200 rounded-2xl px-4 font-black text-[10px] uppercase tracking-widest outline-none focus:border-slate-800"
                >
                    <option value="">Modules</option>
                    <option value="INVENTORY">Inventory</option>
                    <option value="FINANCE">Finance</option>
                    <option value="AUTH">Security</option>
                </select>
            </div>

            {/* ... DataTable ... */}
            {/* Table Section */}
            <div className="flex-1 min-h-0 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
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
    );
}
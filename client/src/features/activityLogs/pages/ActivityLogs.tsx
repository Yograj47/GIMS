import { PageHeader } from "@/components/common/PageHeader";
import { useEffect, useState } from "react";
import { Search, Calendar, Info } from "lucide-react";
import { useActivityLogs } from "../hooks/useActivityLogs";
import { DataTable } from "@/components/common/DataTable";
import { getActivityLogColumns } from "../components/ActivityLogColumns";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/debounce";

export default function ActivityLogsPage() {
    const { logs, fetchLogs, isLoading, meta } = useActivityLogs();

    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
    
    // Track previous filters to detect changes during render without violating rules
    const [prevFilters, setPrevFilters] = useState({ searchQuery, typeFilter, startDate, endDate });

    const debouncedSearch = useDebounce(searchQuery, 400);

    const currentFilters = { searchQuery, typeFilter, startDate, endDate };
    if (
        prevFilters.searchQuery !== currentFilters.searchQuery ||
        prevFilters.typeFilter !== currentFilters.typeFilter ||
        prevFilters.startDate !== currentFilters.startDate ||
        prevFilters.endDate !== currentFilters.endDate
    ) {
        setPrevFilters(currentFilters);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }

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
            <div className="space-y-3 lg:flex lg:h-[calc(100dvh-2.5rem)] lg:flex-col">

                <PageHeader title="System log" icon={Info} description="Review recorded changes and sign-ins by account, time, and outcome." />
                <DataTable fill toolbar={(
                <div className="flex flex-col lg:flex-row gap-3">
                    {/* Search Field */}
                    <div className="relative flex-1 group">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground group-focus-within:text-link transition-colors"
                            size={14}
                            strokeWidth={2.5}
                        />
                        <Input
                            aria-label="Search activity logs" placeholder="Search event, IP, or request ID" maxLength={200}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 bg-card border-border rounded-sm text-sm focus-visible:ring-1
                            focus-visible:ring-brand-500 transition-all shadow-none placeholder:text-slate-300 font-medium"
                        />
                    </div>

                    {/* Date Range Group */}
                    <div className="flex items-center gap-2 bg-card border border-border rounded-sm px-2">
                        <Calendar size={12} className="text-subtle-foreground" />
                        <input
                            type="date"
                            aria-label="From date" max={endDate || undefined} value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent border-none p-1 text-[10px] font-black outline-none text-muted-foreground"
                        />
                        <span className="text-slate-300 text-[10px]">to</span>
                        <input
                            type="date"
                            aria-label="To date" min={startDate || undefined} value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent border-none p-1 text-[10px] font-black outline-none text-muted-foreground"
                        />
                    </div>

                    {/* Module Filter */}
                    <div className="relative min-w-40">
                        <select aria-label="Module"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full h-10 px-4 bg-card border border-border rounded-sm text-[11px] font-bold uppercase tracking-tight text-muted-foreground outline-none hover:border-input focus:border-brand-500 appearance-none cursor-pointer transition-all"
                        >
                            <option value="">All Modules</option>
                            <option value="INVENTORY">Inventory</option>
                            <option value="FINANCE">Finance</option>
                            <option value="AUTH">Security</option>
                            <option value="SYSTEM">System</option>
                        </select>
                    </div>
                </div>

                )}
                        columns={getActivityLogColumns()}
                        renderExpandedRow={({ original: entry }) => (
                            <dl className="grid gap-4 p-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                                {[
                                    ["Request ID", entry.requestId],
                                    ["Source IP", entry.sourceIp],
                                    ["Protocol", entry.protocol?.toUpperCase()],
                                    ["HTTP version", entry.httpVersion],
                                    ["Duration", entry.durationMs === undefined ? undefined : `${entry.durationMs} ms`],
                                    ["Client user agent", entry.userAgent],
                                ].map(([label, value]) => (
                                    <div key={label} className="min-w-0">
                                        <dt className="text-muted-foreground">{label}</dt>
                                        <dd className="mt-1 wrap-anywhere whitespace-normal">{value ?? "Not recorded"}</dd>
                                    </div>
                                ))}
                            </dl>
                        )}
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

import { PageHeader } from "@/components/common/PageHeader";
import { useEffect, useState } from "react"
import { Download, Search, Filter, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/common/DataTable"
import { Input } from "@/components/ui/input"
import { notify } from "@/lib/toast"
import { Loading } from "@/lib/loader"
import { exportToCSV } from "@/lib/csvExport"
import { useMovementTransactions } from "@/features/MovementTransaction/hooks/useMovementTransactions"
import { getMovementColumns } from "../components/MovementColumns"
import { useDebounce } from "@/lib/debounce"

interface MovementTransaction {
    createdAt: string;
    product?: { name?: string };
    movementType: "IN" | "OUT";
    quantity: number;
    unit?: { name?: string };
    reason: string;
    performedBy?: { name?: string };
}

export default function StockMovementReport() {
    const { fetchMovements, movements, isLoading, meta } = useMovementTransactions()
    const [searchQuery, setSearchQuery] = useState("")
    const [movementType, setMovementType] = useState<string>("All Movements")
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const debouncedSearch = useDebounce(searchQuery, 500);

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    // Primary data fetch effect with all required dependencies
    useEffect(() => {
        if (!isExporting) {
            const typeFilter = movementType === "All Movements" ? "" : movementType;
            fetchMovements(pagination.pageIndex + 1, pagination.pageSize, debouncedSearch, typeFilter);
        }
    }, [pagination, debouncedSearch, movementType, isExporting, fetchMovements]);

    // Imperative export handler replacing side-effect based export
    const handleExport = async () => {
        try {
            setIsExporting(true);
            const typeFilter = movementType === "All Movements" ? "" : movementType;

            const exportData = await fetchMovements(1, 1000, debouncedSearch, typeFilter, true);
            const itemsToExport = Array.isArray(exportData) ? exportData : movements;

            if (Array.isArray(itemsToExport) && itemsToExport.length > 0) {
                const rows = itemsToExport.map((m: MovementTransaction) => ({
                    "Date": new Date(m.createdAt).toLocaleString(),
                    "Product": m.product?.name || "N/A",
                    "Type": m.movementType,
                    "Qty": m.movementType === "IN" ? `+${m.quantity}` : `-${m.quantity}`,
                    "Unit": m.unit?.name || "Pcs",
                    "Reason": m.reason,
                    "Operator": m.performedBy?.name || "System"
                }));

                exportToCSV(rows, `Stock_Movement_${new Date().toISOString().split('T')[0]}`);
                notify.success("Export Complete");
            } else {
                notify.error("No movement records available to export");
            }
        } catch {
            notify.error("Failed to export movement ledger");
        } finally {
            setIsExporting(false);
            const typeFilter = movementType === "All Movements" ? "" : movementType;
            fetchMovements(
                pagination.pageIndex + 1,
                pagination.pageSize,
                searchQuery,
                typeFilter
            );
        }
    };

    return (
        <div className="h-full animate-in fade-in duration-500">
            <div className="space-y-3">

                <PageHeader title="Stock movements report" icon={History}>
<Button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="h-9 px-5 bg-brand-600 hover:bg-brand-700 text-white rounded-sm text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm"
                    >
                        {isExporting ? (
                            <><Loading className="mr-2" /> Extracting...</>
                        ) : (
                            <><Download size={14} className="mr-2" /> Export CSV</>
                        )}
                    </Button>
                </PageHeader>
                <DataTable toolbar={(
                <div className="flex flex-col lg:flex-row gap-3">
                    {/* Search Field */}
                    <div className="relative flex-1 group">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground group-focus-within:text-link transition-colors"
                            size={14}
                            strokeWidth={2.5}
                        />
                        <Input
                            aria-label="Search movements" placeholder="Search products or operators"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 bg-card border-border rounded-sm text-sm focus-visible:ring-1
                             focus-visible:ring-brand-500 transition-all shadow-none placeholder:text-slate-300 font-medium"
                        />
                    </div>

                    {/* Movement Type Filter */}
                    <div className="relative min-w-64">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Filter size={12} className="text-link" strokeWidth={3} />
                        </div>
                        <select aria-label="Movement type"
                            value={movementType}
                            onChange={(e) => setMovementType(e.target.value)}
                            className="w-full h-10 pl-9 pr-8 bg-card border border-border rounded-sm text-[11px] font-bold uppercase tracking-tight text-muted-foreground outline-none hover:border-input focus:border-brand-500 appearance-none cursor-pointer transition-all"
                        >
                            <option value="All Movements">All Transactions</option>
                            <option value="IN">Stock Inflow (+)</option>
                            <option value="OUT">Stock Outflow (-)</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-subtle-foreground">
                            <svg width="8" height="8" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 1L5 5L9 1" /></svg>
                        </div>
                    </div>
                </div>

                )}
                        columns={getMovementColumns}
                        data={movements || []}
                        pageCount={meta?.totalPages || 0}
                        rowCount={meta?.totalItems || 0}
                        pagination={pagination}
                        setPagination={setPagination}
                        isLoading={isLoading}
                />
            </div>
        </div>
    )
}

import { useEffect, useState } from "react"
import { Download, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMovementTransactions } from "../../hooks/useMovementTransactions"
import { getMovementColumns } from "../../components/MovementColumns"
import { DataTable } from "@/components/common/DataTable"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { notify } from "@/lib/toast"
import { Loading } from "@/lib/loader"
import { exportToCSV } from "@/lib/csvExport"

export default function StockMovementReport() {
    const { fetchMovements, movements, isLoading, meta } = useMovementTransactions()
    const [searchQuery, setSearchQuery] = useState("")
    const [movementType, setMovementType] = useState<string>("All Movements")
    const [IsExporting, setIsExporting] = useState<boolean>(false);

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    useEffect(() => {
        if (!IsExporting) {
            const typeFilter = movementType === "All Movements" ? "" : movementType;
            fetchMovements(pagination.pageIndex + 1, pagination.pageSize, searchQuery, typeFilter);
        }
    }, [pagination, searchQuery, movementType, IsExporting]);

    const handleExport = () => {
        setIsExporting(true);
        const typeFilter = movementType === "All Movements" ? "" : movementType;
        fetchMovements(1, 1000, searchQuery, typeFilter, true);
    };

    useEffect(() => {
        if (IsExporting && !isLoading && movements.length > 0) {

            const rows = movements.map(m => ({
                "Date": new Date(m.createdAt).toLocaleString(),
                "Product": m.product?.name || "N/A",
                "Type": m.movementType,
                "Qty": m.movementType === "IN" ? `+${m.quantity}` : `-${m.quantity}`,
                "Unit": m.unit?.name || "Pcs",
                "Reason": m.reason,
                "Operator": m.performedBy?.name || "System"
            }));

            exportToCSV(rows, `Stock_Movement_${new Date().toISOString().split('T')[0]}`);
            setIsExporting(false);

            const typeFilter = movementType === "All Movements" ? "" : movementType;
            fetchMovements(pagination.pageIndex + 1, pagination.pageSize, searchQuery, typeFilter);
            notify.success("Export Complete");
        }
    }, [IsExporting, isLoading, movements]);


    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="flex justify-between items-end shrink-0">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Movement Ledger</h1>
                    <p className="text-sm font-medium text-slate-500 italic">Inventory transaction audit trail</p>
                </div>
                <Button onClick={handleExport} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 font-bold text-xs gap-2 h-11 shadow-sm transition-all" disabled={IsExporting}>
                    {
                        IsExporting ? (
                            <>
                                <Loading size="sm" className="mr-2" /> Exporting...
                            </>)
                            :
                            (<><Download size={16} /> Export CSV</>)
                    }
                </Button>
            </div>

            {/* Unified Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                {/* Search Input Group */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        placeholder="Search by Product or Operator..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 border-none bg-transparent font-medium focus-visible:ring-0 shadow-none text-sm placeholder:text-slate-400"
                    />
                </div>

                {/* Vertical Divider (Hidden on Mobile) */}
                <div className="hidden md:block h-8 w-px bg-slate-200" />

                {/* Proper Styled Select Group */}
                <div className="relative w-full md:w-64 px-2">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Filter size={16} className="text-indigo-500" />
                    </div>

                    <select
                        value={movementType}
                        onChange={(e) => setMovementType(e.target.value)}
                        className={cn(
                            "w-full h-12 pl-10 pr-10",
                            "rounded-xl text-xs font-black uppercase tracking-widest text-slate-700",
                            "appearance-none cursor-pointer outline-none transition-all",
                            "focus:border-indigo-100"
                        )}
                    >
                        <option value="All Movements">ALL MOVEMENTS</option>
                        <option value="IN">STOCK IN (ENTRY)</option>
                        <option value="OUT">STOCK OUT (EXIT)</option>
                    </select>

                    {/* Custom Chevron Arrow */}
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* The DataTable Component */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <DataTable
                    columns={getMovementColumns}
                    data={movements || []}
                    rowCount={meta?.totalItems || 0}
                    pageCount={meta?.totalPages || 0}
                    pagination={pagination}
                    setPagination={setPagination}
                    isLoading={isLoading}
                />
            </div>
        </div>
    )
}
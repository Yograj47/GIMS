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
        if (IsExporting && !isLoading && Array.isArray(movements) && movements.length > 0) {

            const rows = movements.map((m: any) => ({
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
            fetchMovements(
                pagination.pageIndex + 1,
                pagination.pageSize,
                searchQuery,
                typeFilter
            );

            notify.success("Export Complete");
        }
    }, [IsExporting, isLoading, movements]);


    console.log(meta);
    

    return (
        <div className="h-full bg-slate-50/50 animate-in fade-in duration-500">
            <div className="max-w-400 mx-auto space-y-6">

                {/* 1. PRECISION HEADER */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-600 rounded-sm text-white shadow-sm shadow-blue-100">
                            <History size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
                                Movement Ledger
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                Audit Trail • <span className="text-blue-600 italic">Global Traffic</span>
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={handleExport}
                        disabled={IsExporting}
                        className="h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-sm text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm"
                    >
                        {IsExporting ? (
                            <><Loading size="sm" className="mr-2" /> Extracting...</>
                        ) : (
                            <><Download size={14} className="mr-2" /> Export CSV</>
                        )}
                    </Button>
                </div>

                {/* 2. PRECISION FILTER BAR */}
                <div className="flex flex-col lg:flex-row gap-3">
                    {/* Search Field */}
                    <div className="relative flex-1 group">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                            size={14}
                            strokeWidth={2.5}
                        />
                        <Input
                            placeholder="Filter by Product, Operator, or Reason..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 bg-white border-slate-200 rounded-sm text-sm focus-visible:ring-1 focus-visible:ring-blue-500 transition-all shadow-none placeholder:text-slate-300 font-medium"
                        />
                    </div>

                    {/* Movement Type Filter */}
                    <div className="relative min-w-64">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Filter size={12} className="text-blue-600" strokeWidth={3} />
                        </div>
                        <select
                            value={movementType}
                            onChange={(e) => setMovementType(e.target.value)}
                            className="w-full h-10 pl-9 pr-8 bg-white border border-slate-200 rounded-sm text-[11px] font-bold uppercase tracking-tight text-slate-600 outline-none hover:border-slate-300 focus:border-blue-500 appearance-none cursor-pointer transition-all"
                        >
                            <option value="All Movements">All Transactions</option>
                            <option value="IN">Stock Inflow (+)</option>
                            <option value="OUT">Stock Outflow (-)</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg width="8" height="8" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 1L5 5L9 1" /></svg>
                        </div>
                    </div>
                </div>

                {/* 3. THE DATA TABLE */}
                <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                    <DataTable
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
        </div>
    )
}
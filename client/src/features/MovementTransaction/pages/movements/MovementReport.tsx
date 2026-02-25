import { useEffect, useState} from "react"
import { Download, Search, ArrowDownLeft, ArrowUpRight, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMovementTransactions } from "../../hooks/useMovementTransactions"
import { getMovementColumns } from "../../components/MovementColumns"
import { DataTable } from "@/components/common/DataTable"
import { cn } from "@/lib/utils"

export default function StockMovementReport() {
    const { fetchMovements, movements, isLoading, meta } = useMovementTransactions()
    const [searchQuery, setSearchQuery] = useState("")
    const [movementType, setMovementType] = useState<string>("") 
    
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    useEffect(() => {
        // Now passing both search and movementType
        fetchMovements(pagination.pageIndex + 1, pagination.pageSize, searchQuery, movementType)
    }, [fetchMovements, pagination, searchQuery, movementType])

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="flex justify-between items-end shrink-0">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                        Movement Ledger<span className="text-indigo-600">.</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Inventory Transaction Audit Trail
                    </p>
                </div>
                <Button className="bg-slate-900 hover:bg-black text-white rounded-xl px-5 font-bold text-xs gap-2 h-11 shadow-lg shadow-slate-200">
                    <Download size={16} /> Export CSV
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 shrink-0">
                {/* Search Input */}
                <div className="flex-1 group">
                    <div className="bg-white border-2 border-slate-200 group-within:border-slate-800 rounded-2xl p-3 flex items-center gap-4 transition-all shadow-sm">
                        <div className="pl-2 text-slate-400 group-within:text-slate-800 transition-colors">
                            <Search size={20} strokeWidth={3} />
                        </div>
                        <input
                            type="text"
                            placeholder="SEARCH BY PRODUCT OR OPERATOR..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none font-black text-xs uppercase tracking-widest placeholder:text-slate-300 text-slate-800"
                        />
                    </div>
                </div>

                {/* Movement Type Toggle */}
                <div className="flex bg-white border-2 border-slate-200 rounded-2xl p-1.5 shadow-sm">
                    {[
                        { label: 'ALL', value: '', icon: Filter },
                        { label: 'STOCK IN', value: 'IN', icon: ArrowDownLeft },
                        { label: 'STOCK OUT', value: 'OUT', icon: ArrowUpRight },
                    ].map((item) => (
                        <button
                            key={item.label}
                            onClick={() => setMovementType(item.value)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all tracking-widest",
                                movementType === item.value 
                                    ? "bg-slate-900 text-white shadow-md" 
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <item.icon size={14} strokeWidth={3} />
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* The DataTable Component */}
            <div className="flex-1 min-h-0 bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm">
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
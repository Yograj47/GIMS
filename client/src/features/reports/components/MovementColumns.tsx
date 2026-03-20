import { cn } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowDownLeft, ArrowUpRight, User, Package } from "lucide-react"

export const getMovementColumns: ColumnDef<any>[] = [
    {
        accessorKey: "createdAt",
        header: "Timestamp",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-mono text-[11px] font-bold text-slate-900 leading-none">
                    {new Date(row.getValue("createdAt")).toLocaleDateString()}
                </span>
                <span className="font-mono text-[9px] font-bold text-slate-400 mt-1">
                    {new Date(row.getValue("createdAt")).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "product.name",
        header: "Inventory / Reason",
        cell: ({ row }) => (
            <div className="flex items-center gap-3 py-1">
                <div className="w-8 h-8 rounded-sm bg-blue-600 text-white flex items-center justify-center shadow-sm">
                    <Package size={14} />
                </div>
                <div className="flex flex-col">
                    <span className="font-black text-slate-900 text-[12px] uppercase tracking-tight leading-tight">
                        {row.original.product?.name || "Unspecified"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 italic lowercase truncate max-w-45">
                        {row.original.reason || "No remark provided"}
                    </span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "movementType",
        header: "Flow Type",
        cell: ({ row }) => {
            const type = row.getValue("movementType") as string
            const isOut = type === "OUT"
            return (
                <div className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border",
                    isOut ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                )}>
                    {isOut ? <ArrowUpRight size={10} strokeWidth={3} /> : <ArrowDownLeft size={10} strokeWidth={3} />}
                    {type}
                </div>
            )
        },
    },
    {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => (
            <div className="font-black text-slate-900 text-[13px] tabular-nums">
                {row.getValue("quantity")} 
                <span className="text-[9px] text-slate-400 uppercase font-black ml-1">
                    {row.original.unitId?.name || "PCS"}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "performedBy.name",
        header: () => <div className="text-right">Authorized By</div>,
        cell: ({ row }) => (
            <div className="flex items-center justify-end gap-2">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                    {row.original.performedBy?.name || "System"}
                </span>
                <div className="w-6 h-6 rounded-sm bg-blue-600 text-white flex items-center justify-center shadow-sm">
                    <User size={12} strokeWidth={2.5} />
                </div>
            </div>
        ),
    },
]
import { cn } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"

export const getMovementColumns: ColumnDef<any>[] = [
    {
        accessorKey: "createdAt",
        header: "Timestamp",
        cell: ({ row }) => (
            <span className="font-mono text-[11px] font-bold text-slate-400">
                {new Date(row.getValue("createdAt")).toLocaleString()}
            </span>
        ),
    },
    {
        accessorKey: "productId.name",
        header: "Personnel / Product",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-black text-slate-800 uppercase tracking-tight">
                    {row.original.productId?.name || "Unknown Product"}
                </span>
                <span className="text-[10px] font-bold text-slate-400 italic">
                    {row.original.reason}
                </span>
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
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                    isOut ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                )}>
                    {isOut ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                    Stock {type}
                </div>
            )
        },
    },
    {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => (
            <div className="font-black text-slate-900">
                {row.getValue("quantity")} <span className="text-[10px] text-slate-400 uppercase">{row.original.unitId?.name}</span>
            </div>
        ),
    },
    {
        accessorKey: "performedBy.name",
        header: "Operator",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 border border-slate-200">
                    {(row.original.performedBy?.name || "S").charAt(0)}
                </div>
                <span className="text-xs font-bold text-slate-600">{row.original.performedBy?.name || "System"}</span>
            </div>
        ),
    },
]
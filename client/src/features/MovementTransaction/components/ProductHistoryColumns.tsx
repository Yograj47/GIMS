import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDownLeft, ArrowUpRight, Clock, User } from "lucide-react";

export const getProductHistoryColumns: ColumnDef<any>[] = [
    {
        accessorKey: "createdAt",
        header: "Time & Date",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-slate-600">
                <Clock size={14} className="text-slate-300" />
                <span className="text-xs font-mono font-bold">
                    {new Date(row.getValue("createdAt")).toLocaleString([], { 
                        dateStyle: 'medium', 
                        timeStyle: 'short' 
                    })}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "movementType",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("movementType") as string;
            const isOut = type === "OUT";
            return (
                <div className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                    isOut ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                )}>
                    {isOut ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                    Stock {type}
                </div>
            );
        },
    },
    {
        accessorKey: "quantity",
        header: "Change",
        cell: ({ row }) => (
            <div className={cn(
                "font-black text-sm",
                row.original.movementType === 'IN' ? "text-emerald-600" : "text-rose-600"
            )}>
                {row.original.movementType === 'IN' ? "+" : "-"}{row.getValue("quantity")}
            </div>
        ),
    },
    {
        id: "balance",
        header: "Balance Stock",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[10px] line-through font-bold">{row.original.oldQuantity}</span>
                <span className="text-indigo-600 font-black text-sm">{row.original.newQuantity}</span>
            </div>
        ),
    },
    {
        accessorKey: "reason",
        header: "Reason / Note",
        cell: ({ row }) => (
            <span className="text-xs font-bold text-slate-500 italic lowercase">
                {row.getValue("reason") || "No notes provided"}
            </span>
        ),
    },
    {
        accessorKey: "performedBy.name",
        header: () => <div className="text-right">Operator</div>,
        cell: ({ row }) => (
            <div className="flex items-center justify-end gap-2">
                <span className="text-[11px] font-black text-slate-600 uppercase">{row.original.performedBy?.name}</span>
                <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                    <User size={14} />
                </div>
            </div>
        ),
    },
];
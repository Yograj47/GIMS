import { cn } from "@/lib/utils";
import type { MovementData } from "@/types/movement";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDownLeft, ArrowUpRight, Clock, User, Hash } from "lucide-react";


export const getProductHistoryColumns: ColumnDef<MovementData>[] = [
    {
        accessorKey: "createdAt",
        header: "Timestamp",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={12} className="text-slate-300" />
                <span className="text-[11px] font-mono font-bold tracking-tight uppercase">
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
        header: "Operation",
        cell: ({ row }) => {
            const type = row.getValue("movementType") as string;
            const isOut = type === "OUT";
            return (
                <div className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border",
                    isOut 
                        ? "bg-rose-50 text-rose-600 border-rose-100" 
                        : "bg-emerald-50 text-emerald-600 border-emerald-100"
                )}>
                    {isOut ? <ArrowUpRight size={10} strokeWidth={3} /> : <ArrowDownLeft size={10} strokeWidth={3} />}
                    {type}
                </div>
            );
        },
    },
    {
        accessorKey: "quantity",
        header: "Delta",
        cell: ({ row }) => {
            const isIn = row.original.movementType === 'IN';
            return (
                <div className={cn(
                    "font-black text-[13px] tabular-nums",
                    isIn ? "text-emerald-600" : "text-rose-600"
                )}>
                    {isIn ? "+" : "-"}{row.getValue("quantity")}
                </div>
            );
        },
    },
    {
        id: "balance",
        header: "Audit Balance",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 group">
                <span className="text-slate-300 text-[10px] font-bold line-through">
                    {row.original.oldQuantity}
                </span>
                <div className="flex items-center gap-1">
                    <Hash size={10} className="text-brand-500 opacity-50" />
                    <span className="text-foreground font-black text-[13px]">{row.original.newQuantity}</span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "reason",
        header: "Notes",
        cell: ({ row }) => (
            <span className="text-[11px] font-bold text-subtle-foreground uppercase tracking-tight truncate max-w-50 block">
                {row.getValue("reason") || "— NO REMARK —"}
            </span>
        ),
    },
    {
        accessorKey: "performedBy.name",
        header: () => <div className="text-right">Auth. User</div>,
        cell: ({ row }) => (
            <div className="flex items-center justify-end gap-2 py-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
                    {row.original.performedBy?.name}
                </span>
                <div className="w-6 h-6 rounded-sm bg-brand-600 text-white flex items-center justify-center shadow-sm">
                    <User size={12} strokeWidth={2.5} />
                </div>
            </div>
        ),
    },
];
import { Package, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { NavigateFunction } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

export const getStockColumns = (navigate: NavigateFunction): ColumnDef<any>[] => [
    {
        accessorKey: "name",
        header: "Product / Unit",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm">
                    <Package size={18} />
                </div>
                <div className="flex flex-col">
                    <span className="font-black text-slate-800 uppercase tracking-tight">
                        {row.getValue("name")}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 italic">
                        {row.original.unit?.name || "Units"}
                    </span>
                </div>
            </div>
        )
    },
    {
        accessorKey: "category.name",
        header: "Category",
        cell: ({ row }) => (
            <Badge variant="outline" className="rounded-lg border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-wider">
                {row.original.category?.name || "General"}
            </Badge>
        )
    },
    {
        accessorKey: "quantity",
        header: "Current Stock",
        cell: ({ row }) => {
            const qty = row.getValue("quantity") as number;
            const threshold = row.original.threshold;
            const isLow = qty <= threshold;

            return (
                <div className="flex flex-col">
                    <span className={cn(
                        "text-sm font-black transition-colors",
                        isLow ? "text-rose-600" : "text-slate-900"
                    )}>
                        {qty} <span className="text-[10px] text-slate-400 font-bold uppercase">{row.original.unit?.shortForm}</span>
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                        Min. Level: {threshold}
                    </span>
                </div>
            );
        }
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
            const qty = row.original.quantity;
            const threshold = row.original.threshold;
            const isLow = qty <= threshold;
            
            return (
                <div className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                    isLow 
                        ? "bg-rose-50 text-rose-600 border-rose-100" 
                        : "bg-emerald-50 text-emerald-600 border-emerald-100"
                )}>
                    {isLow && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                    {isLow ? "Low Stock" : "Healthy"}
                </div>
            );
        }
    },
    {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
            <div className="text-right">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1.5 font-black text-[10px] uppercase tracking-widest transition-all rounded-lg"
                    onClick={() => navigate(`/reports/stock/product-history/${row.original._id}`)}
                >
                    <History size={14} strokeWidth={3} /> History
                </Button>
            </div>
        )
    }
];
import { Package, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NavigateFunction } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import type { ProductData } from "@/types/product";

export const getStockColumns = (navigate: NavigateFunction): ColumnDef<ProductData>[] => [
    {
        accessorKey: "name",
        header: "Product / Identifier",
        cell: ({ row }) => (
            <div className="flex items-center gap-3 py-1">
                <div className="w-8 h-8 rounded-sm bg-brand-600 text-white flex items-center justify-center shadow-sm">
                    <Package size={14} />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-foreground text-[13px] leading-tight">
                        {row.getValue("name")}
                    </span>
                    <span className="text-[10px] text-subtle-foreground font-medium uppercase tracking-tight">
                        SKU · {row.original._id.slice(-6).toUpperCase()}
                    </span>
                </div>
            </div>
        )
    },
    {
        accessorKey: "category.name",
        header: "Category",
        cell: ({ row }) => (
            <span className="text-[11px] font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-sm uppercase tracking-tighter">
                {row.original.category?.name || "General"}
            </span>
        )
    },
    {
        accessorKey: "quantity",
        header: "Inventory Status",
        cell: ({ row }) => {
            const qty = row.getValue("quantity") as number;
            const threshold = row.original.threshold;
            const isOut = qty <= 0;
            const isLow = !isOut && qty <= threshold;

            return (
                <div className="flex items-center gap-3 tabular-nums">
                    <span className={cn(
                        "text-[13px] font-bold px-2 py-0.5 rounded",
                        isOut ? "text-rose-700 bg-rose-50" : isLow ? "text-amber-800 bg-amber-50" : "text-emerald-700 bg-emerald-50"
                    )}>
                        {qty} <span className="text-[9px] uppercase font-black opacity-60 ml-1">{row.original.baseUnit?.shortForm ?? row.original.unit?.shortForm}</span>
                    </span>
                    <div className="flex flex-col border-l border-border pl-3">
                        <span className="text-xs font-medium text-foreground">
                            {isOut ? "Out of stock" : isLow ? "Low stock" : "Healthy"}
                        </span>
                        <span className="text-[9px] font-bold text-subtle-foreground uppercase tracking-tighter">
                            Threshold: {threshold}
                        </span>
                    </div>
                </div>
            );
        }
    },
    {
        id: "actions",
        header: () => <div className="text-right">Audit</div>,
        cell: ({ row }) => (
            <div className="flex justify-end">
                <Button 
                    variant="ghost" 
                    className="h-8 px-3 text-subtle-foreground hover:text-link hover:bg-brand-50 transition-all rounded-sm text-[10px] font-bold uppercase tracking-widest border border-transparent hover:border-brand-100"
                    onClick={() => navigate(`/reports/stock/product-history/${row.original._id}`)}
                >
                    <History size={12} strokeWidth={3} />
                    View History
                </Button>
            </div>
        )
    }
];

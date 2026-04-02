import { Edit3, AlertCircle } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ProductData } from "@/types/Product";
import type { NavigateFunction } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useGlobalStore } from "@/store/globalStore";
import { cn } from "@/lib/utils";
import { AdminGate } from "@/features/auth/components/AdminGate";

export const getProductColumns = (navigate: NavigateFunction): ColumnDef<ProductData>[] => {
    const settings = useGlobalStore.getState().settings;
    const currency = settings?.currency || "Rs";

    return [
        {
            accessorKey: "name",
            header: "Product Details",
            cell: ({ row }) => (
                <div className="flex flex-col py-1">
                    <span className="font-bold text-slate-900 text-[13px] leading-tight">
                        {row.original.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">
                        SKU · {row.original._id.slice(-6).toUpperCase()}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "category.name",
            header: "Category",
            cell: ({ row }) => (
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm uppercase tracking-tighter">
                    {row.original.category.name}
                </span>
            ),
        },
        {
            accessorKey: "quantity",
            header: "Inventory",
            cell: ({ row }) => {
                const isLow = row.original.quantity <= row.original.threshold;
                return (
                    <div className="flex items-center gap-2 tabular-nums">
                        <span className={cn(
                            "text-[13px] font-bold px-2 py-0.5 rounded",
                            isLow ? "text-red-700 bg-red-50" : "text-blue-700 bg-blue-50"
                        )}>
                            {row.original.quantity}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase">
                            {row.original.unit.name}
                        </span>
                        {isLow && <AlertCircle size={12} className="text-red-500 animate-pulse" />}
                    </div>
                );
            },
        },
        {
            id: "pricing",
            header: () => <div className="text-right">Unit Pricing</div>,
            cell: ({ row }) => (
                <div className="text-right tabular-nums">
                    <div className="text-[13px] font-bold text-blue-600">
                        {currency}{row.original.sellingPrice.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase">
                        Cost: {currency}{row.original.basePrice}
                    </div>
                </div>
            ),
        },
        {
            id: "valuation",
            header: () => <div className="text-right">Total Valuation</div>,
            cell: ({ row }) => {
                const totalVal = row.original.quantity * row.original.sellingPrice;
                return (
                    <div className="text-right tabular-nums">
                        <span className="text-[13px] font-black text-emerald-600">
                            {currency}{totalVal.toLocaleString()}
                        </span>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                            Gross Value
                        </div>
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <AdminGate allowedRoles={["owner"]}>
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/products/edit/${row.original._id}`);
                        }}
                    >
                        <Edit3 size={14} />
                    </Button>
                </div>
                </AdminGate>
            ),
        },
    ];
};
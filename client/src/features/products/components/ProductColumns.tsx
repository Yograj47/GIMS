import { Edit3 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ProductData } from "@/types/product";
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
            header: "Product",
            cell: ({ row }) => (
                <div className="flex flex-col py-1">
                    <span className="max-w-52 whitespace-normal break-words font-semibold text-foreground">
                        {row.original.name}
                    </span>
                    <span className="text-[10px] text-subtle-foreground font-medium uppercase tracking-tight">
                        SKU · {row.original._id.slice(-6).toUpperCase()}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "category.name",
            header: "Category",
            cell: ({ row }) => (
                <span className="text-[11px] font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-sm uppercase tracking-tighter">
                    {row.original.category.name}
                </span>
            ),
        },
        {
            accessorKey: "quantity",
            header: "Stock",
            cell: ({ row }) => {
                const { quantity, threshold, baseUnit, unit } = row.original;
                const status = quantity <= 0 ? "Out of stock" : quantity <= threshold ? "Low stock" : "In stock";
                return (
                    <div className="flex flex-col items-start gap-1 tabular-nums">
                        <span className="font-medium text-foreground">{quantity.toLocaleString()} {baseUnit?.shortForm ?? unit.shortForm}</span>
                        <span className={cn(
                            "text-[13px] font-bold px-2 py-0.5 rounded",
                            status === "Out of stock" ? "text-red-700 bg-red-50" :
                                status === "Low stock" ? "text-amber-800 bg-amber-50" : "text-link bg-brand-50"
                        )}>
                            {status}
                        </span>
                    </div>
                );
            },
        },
        {
            id: "pricing",
            header: () => <div className="text-right">Unit Pricing</div>,
            cell: ({ row }) => {
                const { sellingPrice, basePrice, unit, baseUnit } = row.original;
                const pricePerBase = sellingPrice / unit.multiplierToBase;
                const costPerBase = basePrice / unit.multiplierToBase;
                const unitLabel = baseUnit?.shortForm ?? unit.shortForm;
                return (
                    <div className="text-right tabular-nums">
                        <div className="text-[13px] font-bold text-link">
                            {currency}{pricePerBase.toLocaleString(undefined, { maximumFractionDigits: 2 })} / {unitLabel}
                        </div>
                        <div className="text-[10px] text-subtle-foreground font-medium uppercase">
                            Cost: {currency}{costPerBase.toLocaleString(undefined, { maximumFractionDigits: 2 })} / {unitLabel}
                        </div>
                    </div>
                );
            },
        },
        {
            id: "valuation",
            header: () => <div className="text-right">Total Valuation</div>,
            cell: ({ row }) => {
                const { quantity, sellingPrice, unit, baseUnit } = row.original;
                const pricePerBase = sellingPrice / unit.multiplierToBase;
                const totalVal = quantity * pricePerBase;
                const unitLabel = baseUnit?.shortForm ?? unit.shortForm;
                return (
                    <div className="text-right tabular-nums">
                        <span className="text-[13px] font-black text-emerald-600">
                            {currency}{totalVal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                        <div className="text-[9px] text-subtle-foreground font-bold uppercase tracking-tighter">
                            {quantity} {unitLabel} × {currency}{pricePerBase.toFixed(2)}
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
                            aria-label={`Edit ${row.original.name}`}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-subtle-foreground hover:text-link hover:bg-brand-50 transition-all"
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

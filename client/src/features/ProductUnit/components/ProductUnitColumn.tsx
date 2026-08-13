import { Button } from "@/components/ui/button";
import { AdminGate } from "@/features/auth/components/AdminGate";
import type { GroupedProductUnit} from "@/types/product-unit";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, ChevronRight, ChevronDown, Package, Box } from "lucide-react";

type AddUnitCallback = (id: string, name: string) => void;

export const getProductUnitColumns = (onAddUnit: AddUnitCallback): ColumnDef<GroupedProductUnit>[] => [
    {
        id: "expander",
        header: () => <div className="w-8" />,
        cell: ({ row }) => (
            <div className="flex justify-center">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        row.toggleExpanded();
                    }}
                    className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 transition-all active:scale-90"
                    type="button"
                >
                    {row.getIsExpanded() ? (
                        <ChevronDown size={18} className="text-blue-600" />
                    ) : (
                        <ChevronRight size={18} />
                    )}
                </button>
            </div>
        ),
    },
    {
        accessorKey: "productName",
        header: () => (
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                Product Info
            </span>
        ),
        cell: ({ row }) => (
            <div className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <Package size={14} />
                </div>
                <div>
                    <div className="font-bold text-slate-900 text-sm">
                        {row.original.productName}
                    </div>
                    <div className="text-[10px] font-medium text-slate-400">
                        REF: {row.original._id.slice(-6).toUpperCase()}
                    </div>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "conversions",
        header: () => (
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                Conversion Count
            </span>
        ),
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Box size={14} className="text-slate-300" />
                <span className="text-[12px] font-semibold text-slate-700">
                    {row.original.conversions?.length || 0} Units
                </span>
            </div>
        ),
    },
    {
        id: "actions",
        header: () => (
            <AdminGate>
            <div className="text-right text-[11px] font-bold text-slate-500 uppercase tracking-tight pr-4">
                Operations
            </div>
            </AdminGate>
        ),
        cell: ({ row }) => (
            <AdminGate>
            <div className="flex justify-end pr-2">
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddUnit(row.original._id, row.original.productName);
                    }}
                    size="sm"
                    className="h-8 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 transition-all active:scale-95 flex items-center gap-2"
                >
                    <Plus size={14} strokeWidth={2.5} />
                    Map Unit
                </Button>
            </div>
            </AdminGate>
        ),
    },
];
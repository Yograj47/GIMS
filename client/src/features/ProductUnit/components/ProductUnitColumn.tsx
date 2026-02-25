import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, ChevronRight, ChevronDown, Package, Box, Hash } from "lucide-react";

type AddUnitCallback = (id: string, name: string) => void;

export const getProductUnitColumns = (onAddUnit: AddUnitCallback): ColumnDef<any>[] => [
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
                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-all active:scale-90"
                    type="button"
                >
                    {row.getIsExpanded() ? (
                        <ChevronDown size={18} strokeWidth={3} className="text-blue-600 animate-in spin-in-12 duration-300" />
                    ) : (
                        <ChevronRight size={18} strokeWidth={3} className="text-slate-300 hover:text-slate-600 transition-colors" />
                    )}
                </button>
            </div>
        ),
    },
    {
        accessorKey: "productName",
        header: () => (
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                Product Specification
            </span>
        ),
        cell: ({ row }) => (
            <div className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm shrink-0">
                    <Package size={14} strokeWidth={3} />
                </div>
                <div>
                    <div className="font-black text-slate-900 uppercase text-sm tracking-tight leading-tight">
                        {row.original.productName}
                    </div>
                    <div className="text-[9px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                        <Hash size={8} strokeWidth={4} />
                        ID: {row.original._id.slice(-6)}
                    </div>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "conversions",
        header: () => (
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                Mapped Protocols
            </span>
        ),
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Box size={12} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter bg-slate-100 border-2 border-slate-200 px-2 py-0.5 rounded-md">
                    {row.original.conversions?.length || 0} UNITS
                </span>
            </div>
        ),
    },
    {
        id: "actions",
        header: () => (
            <div className="text-right text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 pr-4">
                Operations
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex justify-end">
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddUnit(row.original._id, row.original.productName);
                    }}
                    size="sm"
                    className="h-8 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-black text-[9px] uppercase tracking-widest px-4 shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center gap-2"
                >
                    <Plus size={12} strokeWidth={4} />
                    Attach Unit
                </Button>
            </div>
        ),
    },
];
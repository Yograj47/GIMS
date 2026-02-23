import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, ChevronRight, ChevronDown } from "lucide-react";
type AddUnitCallback = (id: string, name: string) => void;

export const getProductColumns = (onAddUnit: AddUnitCallback): ColumnDef<any>[] => [
    {
        id: "expander",
        header: () => <div className="w-6" />,
        cell: ({ row }) => (
            <div className="flex justify-center">
                {row.getIsExpanded() ? (
                    <ChevronDown size={18} className="text-indigo-600 animate-in fade-in duration-300" />
                ) : (
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                )}
            </div>
        ),
    },
    {
        accessorKey: "productName",
        header: "PRODUCT",
        cell: ({ row }) => (
            <div className="flex items-center gap-4 py-2">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                    {row.original.productName.charAt(0)}
                </div>
                <div>
                    <h3 className="font-bold text-slate-700 leading-tight">{row.original.productName}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                        ID: {row.original._id.slice(-6)}
                    </p>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "conversions",
        header: "UNITS DEFINED",
        cell: ({ row }) => (
            <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase">
                {row.original.conversions.length} Units
            </span>
        ),
    },
    {
        id: "actions",
        header: () => <div className="text-right">QUICK ADD</div>,
        cell: ({ row }) => (
            <div className="flex justify-end">
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddUnit(row.original._id, row.original.productName);
                    }}
                    size="sm"
                    variant="ghost"
                    className="h-9 rounded-xl text-indigo-600 font-bold bg-indigo-50 hover:bg-indigo-100 px-4"
                >
                    <Plus size={14} className="mr-2 stroke-3" /> Add Unit
                </Button>
            </div>
        ),
    },
];
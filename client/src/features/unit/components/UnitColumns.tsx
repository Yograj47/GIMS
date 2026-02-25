import { Badge } from "@/components/ui/badge";
import type { UnitData } from "@/types/Unit";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit3, Trash2, Scale, Layers } from "lucide-react";

export const getUnitColumns = (
    onEdit: (unit: UnitData) => void,
    onDelete: (unitId: string) => void
): ColumnDef<UnitData>[] => [
    {
        accessorKey: "name",
        header: () => (
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                Unit Specification
            </span>
        ),
        cell: ({ row }) => (
            <div className="flex items-center gap-3 min-w-50">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm shrink-0">
                    <Scale size={14} strokeWidth={3} />
                </div>
                <div>
                    <div className="font-black text-slate-900 uppercase text-sm tracking-tight leading-tight">
                        {row.original.name}
                    </div>
                    <div className="flex gap-2 items-center mt-0.5">
                        <span className="text-[9px] font-mono font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-1.5 rounded">
                            {row.original.shortForm}
                        </span>
                        {row.original.baseUnit && (
                            <span className="text-[8px] font-black bg-emerald-100 text-emerald-700 px-1 rounded uppercase tracking-tighter">
                                Base
                            </span>
                        )}
                    </div>
                </div>
            </div>
        )
    },
    {
        accessorKey: "unitType",
        header: () => (
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                Category
            </span>
        ),
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Layers size={12} className="text-slate-400" />
                <Badge className="rounded-md border-2 border-slate-200 bg-white text-slate-900 font-black uppercase text-[9px] px-2 shadow-none transition-none">
                    {row.original.unitType}
                </Badge>
            </div>
        ),
    },
    {
        accessorKey: "multiplierToBase",
        header: () => (
            <div className="text-center text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                Scale Factor
            </div>
        ),
        cell: ({ row }) => (
            <div className="text-center">
                <span className="font-mono font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-lg border-2 border-slate-200 text-xs shadow-sm">
                    {row.original.baseUnit ? "1.000" : (row.original.multiplierToBase || 1).toFixed(3)}
                </span>
            </div>
        ),
    },
    {
        id: "actions",
        header: () => (
            <div className="text-right text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 pr-4">
                Control
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex justify-end gap-2">
                <button 
                    onClick={() => onEdit(row.original)} 
                    className="p-2 border-2 border-transparent hover:border-slate-800 rounded-xl text-slate-400 hover:text-slate-900 transition-all active:scale-90"
                >
                    <Edit3 size={16} strokeWidth={2.5} />
                </button>
                <button 
                    onClick={() => onDelete(row.original._id)} 
                    className="p-2 border-2 border-transparent hover:border-rose-600 rounded-xl text-slate-400 hover:text-rose-600 transition-all active:scale-90"
                >
                    <Trash2 size={16} strokeWidth={2.5} />
                </button>
            </div>
        ),
    },
];
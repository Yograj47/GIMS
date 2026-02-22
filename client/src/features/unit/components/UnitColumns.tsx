import { Badge } from "@/components/ui/badge";
import type { UnitData } from "@/types/Unit";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit3, Trash2 } from "lucide-react";

export const getUnitColumns = (
    onEdit: (unit: UnitData) => void,
    onDelete: (unitId: string) => void
): ColumnDef<UnitData>[] => [
        {
            accessorKey: "name",
            header: "Unit Name",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-black text-slate-900 text-base">{row.original.name}</span>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded w-fit mt-1">
                        {row.original.shortForm}
                    </span>
                </div>)
            ,
        },
        {
            accessorKey: "unitType",
            header: "Type",
            cell: ({ row }) => (
                <Badge variant="outline" className="rounded-md border-2 border-slate-800 text-slate-900 font-black uppercase text-[9px] px-2">
                    {row.original.unitType}
                </Badge>
            ),
        },
        {
            accessorKey: "multiplierToBase",
            header: "Multiplier",
            cell: ({ row }) => (
                <div className="text-center">
                    <span className="font-mono font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                        x{row.original.multiplierToBase || 1}
                    </span>
                </div>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <button onClick={() => onEdit(row.original)} className="p-2 border-2 border-transparent hover:border-slate-800 rounded-lg text-slate-400 hover:text-slate-900 transition-all">
                        <Edit3 size={18} strokeWidth={2.5} />
                    </button>
                    <button onClick={() => onDelete(row.original._id)} className="p-2 border-2 border-transparent hover:border-red-600 rounded-lg text-slate-400 hover:text-red-600 transition-all">
                        <Trash2 size={18} strokeWidth={2.5} />
                    </button>
                </div>
            ),
        },
    ]

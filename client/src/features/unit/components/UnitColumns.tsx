import { AdminGate } from "@/features/auth/components/AdminGate";
import type { UnitData } from "@/types/unit";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit3, Trash2, Scale, Layers } from "lucide-react";

export const getUnitColumns = (
    onEdit: (unit: UnitData) => void,
    onDelete: (unit: UnitData) => void
): ColumnDef<UnitData>[] => [
        {
            accessorKey: "name",
            header: () => (
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-subtle-foreground">
                    Unit Name
                </span>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-3 min-w-45">
                    <div className="w-8 h-8 rounded-sm bg-brand-600 flex items-center justify-center text-white shrink-0 group-hover:bg-brand-600 transition-colors">
                        <Scale size={14} strokeWidth={3} />
                    </div>
                    <div className="flex flex-col">
                        <div className="font-black text-foreground uppercase text-[12px] tracking-tight leading-none mb-1">
                            {row.original.name}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-black text-link uppercase tracking-widest bg-brand-50 px-1.5 rounded-sm border border-brand-100">
                                {row.original.shortForm}
                            </span>
                            {row.original.baseUnit && (
                                <span className="text-[8px] font-black bg-secondary text-muted-foreground border border-border px-1 rounded-sm uppercase tracking-tighter">
                                    MASTER-UNIT
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
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-subtle-foreground">
                    Dimension
                </span>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Layers size={11} className="text-subtle-foreground" />
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">
                        {row.original.unitType}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "multiplierToBase",
            header: () => (
                <div className="text-center text-[10px] font-black uppercase tracking-[0.15em] text-subtle-foreground">
                    Factor Ratio
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center">
                    <span className="font-mono font-black text-foreground bg-muted px-3 py-1 rounded-sm border border-border text-[10px] tabular-nums">
                        x {row.original.baseUnit ? "1.000" : (row.original.multiplierToBase || 1).toFixed(4)}
                    </span>
                </div>
            ),
        },
        {
            id: "actions",
            header: () => (
                <AdminGate>
                    <div className="text-right text-[10px] font-black uppercase tracking-[0.15em] text-subtle-foreground pr-4">
                        Control
                    </div>
                </AdminGate>
            ),
            cell: ({ row }) => (
                <AdminGate>
                    <div className="flex justify-end gap-1 pr-2">
                        <button
                            onClick={() => onEdit(row.original)}
                            aria-label={`Edit ${row.original.name}`}
                            className="h-8 w-8 flex items-center justify-center rounded-sm text-subtle-foreground hover:text-link hover:bg-brand-50 border border-transparent hover:border-brand-100 transition-all"
                        >
                            <Edit3 size={14} strokeWidth={2.5} />
                        </button>
                        <button
                            onClick={() => onDelete(row.original)}
                            aria-label={`Delete ${row.original.name}`}
                            className="h-8 w-8 flex items-center justify-center rounded-sm text-subtle-foreground hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                        >
                            <Trash2 size={14} strokeWidth={2.5} />
                        </button>
                    </div>
                </AdminGate>
            ),
        },
    ];

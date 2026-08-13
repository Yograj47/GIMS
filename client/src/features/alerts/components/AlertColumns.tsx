import { CheckCircle2, Bell, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import type { AlertData } from "@/types/alert";
import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

export const getAlertColumns = (onResolve: (id: string) => void): ColumnDef<AlertData>[] => [
    {
        accessorKey: "productId.name",
        header: "Alert Details",
        cell: ({ row }) => {
            const isCritical = row.original.severity === 'critical';
            return (
                <div className="flex items-center gap-3 py-1">
                    <div className={cn(
                        "w-8 h-8 rounded-sm flex items-center justify-center text-white",
                        row.original.resolved ? "bg-emerald-600" :        // green = resolved
                            row.original.acknowledged ? "bg-amber-500" :      // yellow = acknowledged
                                isCritical ? "bg-rose-600" : "bg-orange-600"      // red/orange = active
                    )}>
                        <Bell size={14} strokeWidth={3} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-[13px] leading-tight">
                            {row.original.productId?.name || "SYSTEM CORE"}
                        </span>
                        <span className={cn(
                            "text-[9px] font-bold uppercase tracking-tight",
                            isCritical ? "text-rose-600" : "text-blue-600"
                        )}>
                            VAL: {row.original.snapshotValue}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "message",
        header: "Log Message",
        cell: ({ row }) => (
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter italic">
                {row.original.message}
            </span>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Logged At",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-slate-400 tabular-nums">
                <Calendar size={12} strokeWidth={3} />
                <span className="text-[10px] font-bold uppercase">
                    {format(new Date(row.original.createdAt), "dd MMM · HH:mm")}
                </span>
            </div>
        ),
    },
    {
        id: "actions",
        header: () => <div className="text-right">Control</div>,
        cell: ({ row }) => {
            const { resolved, acknowledged } = row.original;
            return (
                <div className="flex justify-end gap-2">
                    {resolved ? (
                        <div className="h-8 px-3 text-emerald-600 flex items-center gap-2 bg-emerald-50 rounded-sm">
                            <CheckCircle2 size={14} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase tracking-wider">Resolved</span>
                        </div>
                    ) : acknowledged ? (
                        <div className="h-8 px-3 text-amber-600 flex items-center gap-2 bg-amber-50 rounded-sm">
                            <CheckCircle2 size={14} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase tracking-wider">Acknowledged</span>
                        </div>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onResolve(row.original._id)}
                            className="h-8 px-4 border border-slate-200 hover:border-slate-900 hover:bg-slate-900 text-slate-500 hover:text-white rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all"
                        >
                            Acknowledge
                        </Button>
                    )}
                </div>
            );
        },
    },
];
import { CheckCircle2, AlertCircle, Bell, Calendar, } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import type { AlertData } from "@/types/Alert";
import type { ColumnDef } from "@tanstack/react-table";

export const getAlertColumns = (
  onResolve: (id: string) => void
): ColumnDef<AlertData>[] => [
  {
    accessorKey: "productId.name",
    header: () => (
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
        Subject
      </span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm ${
          row.original.severity === 'critical' ? 'bg-rose-600' : 'bg-slate-900'
        }`}>
          <Bell size={14} strokeWidth={3} />
        </div>
        <div>
          <div className="font-black text-slate-900 uppercase text-sm tracking-tight">
            {row.original.productId?.name || "SYSTEM ALERT"}
          </div>
          <div className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">
            VAL: {row.original.snapshotValue}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "message",
    header: () => (
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
        Status Log
      </span>
    ),
    cell: ({ row }) => (
      <div className="max-w-75">
        <p className="text-xs font-bold text-slate-500 line-clamp-1 italic uppercase">
          {row.original.message}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => (
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
        Logged At
      </span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-slate-400">
        <Calendar size={12} strokeWidth={3} />
        <span className="text-[10px] font-black uppercase">
          {format(new Date(row.original.createdAt), "dd MMM HH:mm")}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    header: () => (
      <div className="text-right text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
        Control
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        {row.original.resolved ? (
          <div className="p-2 text-emerald-500 flex items-center gap-2">
            <CheckCircle2 size={16} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase">Resolved</span>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onResolve(row.original._id)}
            className="px-4 py-2 border-2 border-slate-200 hover:border-slate-800 rounded-xl text-slate-400 hover:text-slate-900 transition-all active:scale-90 flex items-center gap-2"
          >
            <span className="text-[10px] font-black uppercase">Acknowledge</span>
            <AlertCircle size={14} strokeWidth={2.5} />
          </Button>
        )}
      </div>
    ),
  },
];
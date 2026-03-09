import { Calendar, User, Info } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { ActivityLogData } from "@/types/ActivityLog";
import type { ColumnDef } from "@tanstack/react-table";

const getTypeStyles = (type: string) => {
  switch (type.toUpperCase()) {
    case 'FINANCE': return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'INVENTORY': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'AUTH': return 'bg-purple-50 text-purple-600 border-purple-100';
    case 'SYSTEM': return 'bg-rose-50 text-rose-600 border-rose-100';
    default: return 'bg-slate-50 text-slate-600 border-slate-100';
  }
};

export const getActivityLogColumns = (): ColumnDef<ActivityLogData>[] => [
  {
    accessorKey: "message",
    header: () => <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Activity Detail</span>,
    cell: ({ row }) => (
      <div className="flex items-start gap-3 py-1">
        <div className="mt-0.5 text-slate-300">
          <Info size={14} strokeWidth={3} />
        </div>
        <p className="text-sm font-bold text-slate-800 leading-tight">
          {row.original.message}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "performedBy",
    header: () => <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Operator</span>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
          <User size={12} strokeWidth={3} />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black text-slate-700 uppercase tracking-tight">
            {row.original.performedBy?.name || "System"}
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase">
            {row.original.performedBy?.role || "Automated"}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: () => <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Module</span>,
    cell: ({ row }) => (
      <Badge variant="outline" className={`rounded-lg px-2 py-0.5 text-[9px] font-black uppercase border-2 ${getTypeStyles(row.original.type)}`}>
        {row.original.type}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</span>,
    cell: ({ row }) => (
      <div className="flex flex-col text-slate-400 font-mono">
        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500">
          <Calendar size={10} strokeWidth={3} />
          {format(new Date(row.original.createdAt), "dd MMM, yyyy")}
        </div>
        <span className="text-[9px] font-bold ml-4">
          {format(new Date(row.original.createdAt), "HH:mm:ss")}
        </span>
      </div>
    ),
  },
];
import { Info, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { ActivityLogData } from "@/types/ActivityLog";
import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

const getTypeStyles = (type: string) => {
  switch (type.toUpperCase()) {
    case 'FINANCE': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'INVENTORY': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'AUTH': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'SYSTEM': return 'bg-rose-50 text-rose-700 border-rose-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

export const getActivityLogColumns = (): ColumnDef<ActivityLogData>[] => [
  {
    accessorKey: "message",
    header: "Activity Detail",
    cell: ({ row }) => (
      <div className="flex items-center gap-3 py-1">
        <div className={`w-8 h-8 rounded-sm ${getTypeStyles(row.original.type)} flex items-center justify-center shadow-sm shrink-0`}>
          <Info size={14} />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 text-[12px] leading-tight uppercase">
            {row.original.message}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn(
              "text-[8px] font-black px-1.5 py-0.5 rounded-sm border uppercase tracking-widest",
              getTypeStyles(row.original.type)
            )}>
              {row.original.type}
            </span>
          </div>
        </div>
      </div>
    )
  },
  {
    accessorKey: "performedBy",
    header: "Operator",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {/* SKU-style Identifier Box */}
        <div className="w-6 h-6 rounded-sm bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
          <User size={12} strokeWidth={3} />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-slate-700 uppercase">
            {row.original.performedBy?.name || "System"}
          </span>
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">
            {row.original.performedBy?.role || "Automated"}
          </span>
        </div>
      </div>
    )
  },
  {
    accessorKey: "createdAt",
    header: "Timestamp",
    cell: ({ row }) => (
      <div className="flex flex-col tabular-nums">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 uppercase">
          <Calendar size={10} strokeWidth={3} className="text-slate-400" />
          {format(new Date(row.original.createdAt), "dd MMM, yyyy")}
        </div>
        <span className="text-[10px] font-bold text-blue-600 uppercase mt-0.5 ml-4">
          {format(new Date(row.original.createdAt), "HH:mm:ss")}
        </span>
      </div>
    )
  }
];
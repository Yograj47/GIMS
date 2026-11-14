import { Info, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { ActivityLogData } from "@/types/activity-log";
import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

const getTypeStyles = (type: string) => {
  switch (type.toUpperCase()) {
    case 'FINANCE': return 'bg-brand-50 text-link border-brand-200';
    case 'INVENTORY': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'AUTH': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'SYSTEM': return 'bg-rose-50 text-rose-700 border-rose-200';
    default: return 'bg-secondary text-muted-foreground border-border';
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
          <span className="font-bold text-foreground text-[12px] leading-tight uppercase">
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
        <div className="w-6 h-6 rounded-sm bg-secondary flex items-center justify-center text-muted-foreground border border-border">
          <User size={12} strokeWidth={3} />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-foreground uppercase">
            {row.original.performedBy?.name || "System"}
          </span>
          <span className="text-[9px] text-subtle-foreground font-black uppercase tracking-tighter">
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
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground uppercase">
          <Calendar size={10} strokeWidth={3} className="text-subtle-foreground" />
          {format(new Date(row.original.createdAt), "dd MMM, yyyy")}
        </div>
        <span className="text-[10px] font-bold text-link uppercase mt-0.5 ml-4">
          {format(new Date(row.original.createdAt), "HH:mm:ss")}
        </span>
      </div>
    )
  }
];
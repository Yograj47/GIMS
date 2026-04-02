import { Edit3, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import type { CategoryData } from "@/types/Category";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminGate } from "@/features/auth/components/AdminGate";

export const getCategoryColumns = (
  onEdit: (category: CategoryData) => void,
  onDelete: (category: CategoryData) => void
): ColumnDef<CategoryData>[] => [
    {
      accessorKey: "name",
      header: () => (
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
          Category Name
        </span>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-blue-600 flex items-center justify-center text-white shrink-0 group-hover:bg-blue-600 transition-colors">
            <span className="font-black text-[10px] uppercase">{row.original.name.charAt(0)}</span>
          </div>
          <div className="flex flex-col">
            <div className="font-black text-slate-600 uppercase text-[12px] tracking-tight leading-none mb-1">
              {row.original.name}
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
              ID · {row.original._id.slice(-6).toUpperCase()}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: () => (
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
          Definition / Specs
        </span>
      ),
      cell: ({ row }) => (
        <div className="max-w-75">
          <p className="text-[11px] font-bold text-slate-500 line-clamp-1 uppercase tracking-tight">
            {row.original.description || "NO SPECIFICATION PROVIDED"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <div className="text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
            Initialized
          </span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2 text-slate-400 tabular-nums">
          <Calendar size={10} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-tight">
            {format(new Date(row.original.createdAt), "dd MMM yyyy")}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: () => (
        <AdminGate>
          <div className="text-right pr-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
            Control
          </div>
        </AdminGate>
      ),
      cell: ({ row }) => (
        <AdminGate>
          <div className="flex justify-end gap-1 pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row.original)}
              className="h-8 w-8 p-0 rounded-sm text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all"
            >
              <Edit3 size={14} strokeWidth={2.5} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(row.original)}
              className="h-8 w-8 p-0 rounded-sm text-slate-400 hover:text-rose-600..."
            >
              <Trash2 size={14} strokeWidth={2.5} />
            </Button>
          </div>
        </AdminGate>
      ),
    },
  ];
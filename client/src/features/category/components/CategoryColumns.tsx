import { Edit3, Trash2, Calendar, Hash } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import type { CategoryData } from "@/types/Category";
import type { ColumnDef } from "@tanstack/react-table";

export const getCategoryColumns = (
  onEdit: (category: CategoryData) => void,
  onDelete: (id: string) => void
): ColumnDef<CategoryData>[] => [
    {
      accessorKey: "name",
      header: () => (
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
          Classification
        </span>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm">
            <Hash size={14} strokeWidth={3} />
          </div>
          <div>
            <div className="font-black text-slate-900 uppercase text-sm tracking-tight">
              {row.original.name}
            </div>
            <div className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">
              ID: {row.original._id.slice(-6)}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: () => (
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
          Definition
        </span>
      ),
      cell: ({ row }) => (
        <div className="max-w-75">
          <p className="text-xs font-bold text-slate-500 line-clamp-1 italic">
            {row.original.description || "NO SPECIFICATION PROVIDED"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
          Initialized
        </span>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-400">
          <Calendar size={12} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase">
            {format(new Date(row.original.createdAt), "dd MMM yyyy")}
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row.original)}
            className="p-2 border-2 border-transparent hover:border-slate-800 rounded-xl text-slate-400 hover:text-slate-900 transition-all active:scale-90"
          >
            <Edit3 size={14} strokeWidth={2.5} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row.original._id)}
            className="p-2 border-2 border-transparent hover:border-rose-600 rounded-xl text-slate-400 hover:text-rose-600 transition-all active:scale-90"
          >
            <Trash2 size={14} strokeWidth={2.5} />
          </Button>
        </div>
      ),
    },
  ];
import { Edit3, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import type { CategoryData } from "@/types/category";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminGate } from "@/features/auth/components/AdminGate";

export const getCategoryColumns = (
  onEdit: (category: CategoryData) => void,
  onDelete: (category: CategoryData) => void
): ColumnDef<CategoryData>[] => [
    {
      accessorKey: "name",
      header: () => (
        <span className="text-xs font-semibold text-muted-foreground">
          Category
        </span>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-brand-600 flex items-center justify-center text-white shrink-0 group-hover:bg-brand-600 transition-colors">
            <span className="font-black text-xs uppercase">{row.original.name.charAt(0)}</span>
          </div>
          <div className="flex flex-col">
            <div className="font-semibold text-foreground leading-tight">
              {row.original.name}
            </div>
            <div className="text-xs font-bold text-subtle-foreground er">
              ID · {row.original._id.slice(-6).toUpperCase()}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: () => (
        <span className="text-xs font-semibold text-muted-foreground">
          Description
        </span>
      ),
      cell: ({ row }) => (
        <div className="max-w-75">
          <p className="text-xs font-bold text-muted-foreground line-clamp-1 ">
            {row.original.description || "No description"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <div className="text-center">
          <span className="text-xs font-semibold text-muted-foreground">
            Created
          </span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2 text-subtle-foreground tabular-nums">
          <Calendar size={10} strokeWidth={3} />
          <span className="text-xs font-black ">
            {format(new Date(row.original.createdAt), "dd MMM yyyy")}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: () => (
        <AdminGate allowedRoles={["owner"]}>
          <div className="text-right pr-4 text-xs font-semibold text-muted-foreground">
            Actions
          </div>
        </AdminGate>
      ),
      cell: ({ row }) => (
        <AdminGate allowedRoles={["owner"]}>
          <div className="flex justify-end gap-1 pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row.original)}
              aria-label={`Edit ${row.original.name}`}
              className="h-8 w-8 p-0 rounded-sm text-subtle-foreground hover:text-link hover:bg-brand-50 border border-transparent hover:border-brand-100 transition-all"
            >
              <Edit3 size={14} strokeWidth={2.5} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(row.original)}
              aria-label={`Delete ${row.original.name}`}
              className="h-8 w-8 p-0 rounded-sm text-subtle-foreground hover:text-destructive"
            >
              <Trash2 size={14} strokeWidth={2.5} />
            </Button>
          </div>
        </AdminGate>
      ),
    },
  ];

import { ArrowDownLeft, ArrowUpRight, CheckCircle2, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";

export const getTransactionColumns = (navigate: any): ColumnDef<any>[] => [
  {
    accessorKey: "_id",
    header: "Transaction ID",
    cell: ({ row }) => (
      <span className="text-sm font-bold text-slate-700">
        #{row.original._id.toString().slice(-6).toUpperCase()}
      </span>
    ),
  },
  {
    accessorKey: "transactionType",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.transactionType;
      const isSale = type === "Sale";
      return (
        <div className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-lg w-fit text-[10px] font-black uppercase",
          isSale ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
        )}>
          {isSale ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
          {type}
        </div>
      );
    },
  },
  {
    accessorKey: "grandTotal",
    header: () => <div className="text-center">Amount</div>,
    cell: ({ row }) => (
      <div className="text-sm font-black text-slate-900 text-center">
        Rs {row.original.grandTotal.toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "isPaid",
    header: () => <div className="text-center">Settled</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        {row.original.isPaid ? (
          <div className="flex items-center gap-1 text-emerald-500 text-[11px] font-bold">
            <CheckCircle2 size={16} /> Yes
          </div>
        ) : (
          <div className="flex items-center gap-1 text-rose-500 text-[11px] font-bold">
            <XCircle size={16} /> No
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => (
      <div className="text-xs font-medium text-slate-400 truncate max-w-50">
        {row.original.notes || "---"}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Action</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/reports/transaction/${row.original._id}`, { state: { transaction: row.original } })}
          className="rounded-lg h-8 w-8 p-0 hover:bg-indigo-50 hover:text-indigo-600"
        >
          <Eye size={16} />
        </Button>
      </div>
    ),
  },
  ];
import { Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { NavigateFunction } from "react-router-dom";
import type { TransactionData } from "@/types/transaction";

export const getTransactionColumns = (navigate: NavigateFunction): ColumnDef<TransactionData>[] => [
  {
    accessorKey: "partyDetails.name",
    header: "Party / Invoice",
    cell: ({ row }) => (
      <div className="flex flex-col py-1">
        <span className="font-bold text-slate-900 text-[13px] leading-tight">
          {row.original.partyDetails?.name || "Cash Customer"}
        </span>
        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">
          #{row.original._id.slice(-6).toUpperCase()} • {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      </div>
    )
  },
  {
    accessorKey: "transactionType",
    header: "Type",
    cell: ({ row }) => {
      const isSale = row.original.transactionType === "Sale";
      return (
        <span className={cn(
          "text-[10px] font-black px-2 py-0.5 rounded-sm uppercase border",
          isSale ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
        )}>
          {row.original.transactionType}
        </span>
      );
    }
  },
  {
    accessorKey: "grandTotal",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">
        <div className="text-sm font-black text-slate-900">
          Rs {row.original.grandTotal.toLocaleString()}
        </div>
        <div className={cn(
          "text-[9px] font-bold uppercase",
          row.original.isPaid ? "text-emerald-500" : "text-rose-500"
        )}>
          {row.original.isPaid ? "Settled" : "Unpaid"}
        </div>
      </div>
    )
  },
  {
    id: "actions",
    header: () => <div className="text-right">Action</div>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button
          variant="ghost"
          className="h-8 px-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-sm text-[10px] font-bold uppercase tracking-widest border border-transparent hover:border-indigo-100"
          onClick={() => navigate(`/reports/transaction/${row.original._id}`, { state: { transaction: row.original } })}
        >
          <Newspaper size={12} className="mr-2" /> View Bill
        </Button>
      </div>
    )
  }
];
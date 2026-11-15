import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { NavigateFunction } from "react-router-dom";
import type { TransactionData } from "@/types/transaction";

export const getTransactionColumns = (navigate: NavigateFunction): ColumnDef<TransactionData>[] => [
  {
    accessorKey: "partyDetails.name",
    header: "Customer / Reference",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span className="font-medium text-foreground">
          {row.original.partyDetails?.name || "Cash Customer"}
        </span>
        <span className="text-xs text-muted-foreground">
          #{row.original._id.slice(-6).toUpperCase()} / {new Date(row.original.createdAt).toLocaleDateString()}
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
          "inline-flex rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium",
          isSale ? "text-link" : "text-muted-foreground"
        )}>
          {row.original.transactionType}{isSale && (row.original.channel === "online" ? " / Online" : " / In store")}
        </span>
      );
    }
  },
  {
    accessorKey: "grandTotal",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">
        <div className="text-sm font-semibold text-foreground">
          Rs {row.original.grandTotal.toLocaleString()}
        </div>
        <div className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium",
          row.original.isPaid ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
        )}>
          <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
          {row.original.isPaid ? "Settled" : "Unpaid"}
        </div>
      </div>
    )
  },
  {
    id: "actions",
    header: () => <div className="text-right">Details</div>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="font-medium shadow-none"
          onClick={() => navigate(`/reports/transaction/${row.original._id}`, { state: { transaction: row.original } })}
        >
          <Eye aria-hidden="true" /> View bill
        </Button>
      </div>
    )
  }
];

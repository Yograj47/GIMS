import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import type { SupplierData } from "@/types/supplier";
import { cn } from "@/lib/utils";

export const getSupplierColumns = (billing = false): ColumnDef<SupplierData>[] => [
    {
        accessorKey: "name",
        header: "Supplier",
        cell: ({ row }) => (
            <Link className="font-semibold text-link underline-offset-4 hover:underline"
                to={`/suppliers/v/${row.original._id}${billing ? "/billing" : ""}`}>
                {row.original.name}
            </Link>
        ),
    },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "address", header: "Address" },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
            <span className={cn(
                "rounded-full px-2 py-1 text-xs font-medium",
                row.original.isActive ? "bg-emerald-50 text-emerald-800" : "bg-secondary text-muted-foreground",
            )}>
                {row.original.isActive ? "Active" : "Inactive"}
            </span>
        ),
    },
];

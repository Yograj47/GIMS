import { Edit3, MapPin, Phone } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { SupplierData } from "@/types/supplier";
import type { NavigateFunction } from "react-router-dom";
import { Link } from "react-router-dom";
import { AdminGate } from "@/features/auth/components/AdminGate";
import { Button } from "@/components/ui/button";

export const getSupplierColumns = (navigate: NavigateFunction): ColumnDef<SupplierData>[] => [
    {
        accessorKey: "name",
        header: "Supplier Details",
        cell: ({ row }) => (
            <div className="flex flex-col py-1">
                <Link className="text-sm font-semibold text-brand-700 underline-offset-4 hover:underline"
                      to={`/suppliers/v/${row.original._id}`}>
                    {row.original.name}
                </Link>
                <Link className="mt-1 w-fit text-xs text-slate-600 underline-offset-4 hover:underline"
                      to={`/suppliers/v/${row.original._id}#receiving`}>Receiving and returns</Link>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">
                    REF · {row.original._id.slice(-6).toUpperCase()}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "phone",
        header: "Contact Info",
        cell: ({ row }) => (
            <div className="flex flex-col tabular-nums">
                <div className="flex items-center gap-1.5 text-brand-600 font-bold text-[12px]">
                    <Phone size={10} strokeWidth={3} />
                    {row.original.phone}
                </div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                    Primary Line
                </span>
            </div>
        ),
    },
    {
        accessorKey: "address",
        header: "Location",
        cell: ({ row }) => (
            <div className="flex flex-col max-w-62.5">
                <div className="flex items-center gap-1 text-slate-700 font-bold text-[11px] truncate">
                    <MapPin size={10} className="shrink-0" />
                    {row.original.address}
                </div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                    Registered Hub
                </span>
            </div>
        ),
    },
    {
        id: "status",
        header: () => <div className="text-right">Registry Status</div>,
        cell: () => (
            <div className="text-right">
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm uppercase tracking-widest border border-emerald-100">
                    Active Partner
                </span>
            </div>
        ),
    },
    {
        id: "actions",
        header: "",
        cell: ({ row }) => (
            <AdminGate allowedRoles={["owner"]}><div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" asChild><Link to={`/suppliers/v/${row.original._id}/billing`}>Billing</Link></Button>
                <Button
                    aria-label={`Edit ${row.original.name}`}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/suppliers/edit/${row.original._id}`);
                    }}
                >
                    <Edit3 size={14} />
                </Button>
            </div></AdminGate>
        ),
    },
];

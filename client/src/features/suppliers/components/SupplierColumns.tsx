import { Eye, Phone, MapPin, Building2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { SupplierData } from "@/types/Supplier";
import type{ NavigateFunction } from "react-router-dom";

export const getSupplierColumns = (navigate: NavigateFunction): ColumnDef<SupplierData>[] => [
    {
        accessorKey: "name",
        header: "Supplier Details",
        cell: ({ row }) => {
            const supplier = row.original;
            return (
                <div className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        {supplier.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-black text-slate-900 text-sm uppercase tracking-tight">
                            {supplier.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] flex items-center gap-1 mt-0.5">
                            <Building2 size={10} strokeWidth={3} />
                            Partner Vendor
                        </div>
                    </div>
                </div>
            );
        }
    },
    {
        accessorKey: "phone",
        header: "Phone Number",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 rounded-lg text-slate-400 border border-slate-200">
                    <Phone size={14} />
                </div>
                <span className="text-sm font-bold text-slate-700 font-mono tracking-tighter">
                    {row.getValue("phone")}
                </span>
            </div>
        )
    },
    {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => (
            <div className="flex items-start gap-2 max-w-62.5">
                <MapPin size={14} className="text-slate-300 mt-0.5 shrink-0" />
                <span className="text-xs text-slate-500 font-bold leading-snug line-clamp-1 italic">
                    {row.getValue("address")}
                </span>
            </div>
        )
    },
    {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
            <div className="text-right">
                <button 
                    onClick={() => navigate(`/suppliers/v/${row.original._id}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm active:scale-95"
                >
                    <Eye size={14} strokeWidth={3} />
                    View Details
                </button>
            </div>
        )
    }
];
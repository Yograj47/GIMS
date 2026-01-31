import { Eye, Phone, MapPin, Building2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import type { SupplierApiResponse } from "@/interface/Supplier";

function SupplierListing({ Supplier }: { Supplier: SupplierApiResponse }) {
    const navigate = useNavigate();
    const { name, phone, address } = Supplier.data;
    const initial = name.charAt(0).toUpperCase();

    return (
        <tr className="group hover:bg-slate-50/80 transition-all duration-200 border-b border-slate-50 last:border-0">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {initial}
                    </div>
                    <div>
                        <div className="font-bold text-slate-900 text-sm leading-tight">{name}</div>
                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1 mt-0.5">
                            <Building2 size={10} />
                            Partner Vendor
                        </div>
                    </div>
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 rounded-md text-slate-400">
                        <Phone size={14} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{phone}</span>
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="flex items-start gap-2 max-w-62.5">
                    <MapPin size={14} className="text-slate-300 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-500 font-medium leading-snug line-clamp-1">
                        {address}
                    </span>
                </div>
            </td>

            {/* ACTION: VIEW DETAILS */}
            <td className="px-6 py-4 text-right">
                <button 
                    onClick={() => navigate(`/suppliers/${Supplier._id}`)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm active:scale-95"
                >
                    <Eye size={14} strokeWidth={2.5} />
                    View Details
                </button>
            </td>
        </tr>
    );
}

export default SupplierListing;
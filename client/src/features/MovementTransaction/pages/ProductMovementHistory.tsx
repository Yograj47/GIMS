import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { 
  ArrowLeft, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Package, 
  User, 
  Clock, 
  Info 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMovementTransactions } from "../hooks/useMovementTransactions";
import { Loading } from "@/lib/loader";

export default function ProductMovementHistory() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { fetchProductMovements, productMovements, isLoading } = useMovementTransactions();

    console.log(productId);
    

    useEffect(() => {
        if (productId) {
            fetchProductMovements(productId);
        }
    }, [productId, fetchProductMovements]);

    console.log(productMovements);
    

    // Calculate some quick stats from movements
    const totalIn = productMovements.filter(m => m.movementType === 'IN').reduce((acc, m) => acc + m.quantity, 0);
    const totalOut = productMovements.filter(m => m.movementType === 'OUT').reduce((acc, m) => acc + m.quantity, 0);

    return (
        <div className="min-h-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
            {/* Navigation & Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => navigate(-1)}
                        className="rounded-xl border-slate-200 hover:bg-white hover:text-indigo-600 shadow-sm"
                    >
                        <ArrowLeft size={18} />
                    </Button>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Movement History</h1>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                            <Package size={14} className="text-indigo-500" />
                            <span>{productMovements[0]?.productId?.name || "Product Audit Trail"}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Summary Cards */}
                <div className="flex gap-3">
                    <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
                        <p className="text-[10px] font-black text-emerald-600 uppercase">Total In</p>
                        <p className="text-lg font-black text-emerald-700">+{totalIn}</p>
                    </div>
                    <div className="bg-rose-50 px-4 py-2 rounded-2xl border border-rose-100">
                        <p className="text-[10px] font-black text-rose-600 uppercase">Total Out</p>
                        <p className="text-lg font-black text-rose-700">-{totalOut}</p>
                    </div>
                </div>
            </div>

            {/* Movement Timeline/Table */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th className="px-6 py-5">Time & Date</th>
                            <th className="px-6 py-5">Type</th>
                            <th className="px-6 py-5 text-center">Change</th>
                            <th className="px-6 py-5 text-center">Balance Stock</th>
                            <th className="px-6 py-5">Reason / Note</th>
                            <th className="px-6 py-5 text-right">Handled By</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {isLoading ? (
                            <tr><td colSpan={6} className="py-20 text-center"><Loading /></td></tr>
                        ) : productMovements.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <Info size={40} strokeWidth={1} />
                                        <p className="font-medium">No movement data available for this product.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            productMovements.map((m) => (
                                <tr key={m._id} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Clock size={14} className="text-slate-300" />
                                            <span className="text-xs font-mono font-bold">
                                                {new Date(m.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <Badge className={cn(
                                            "rounded-lg px-2 py-0.5 font-black text-[10px] uppercase border-none tracking-tighter",
                                            m.movementType === 'IN' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                        )}>
                                            {m.movementType === 'IN' ? "Stock In" : "Stock Out"}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className={cn(
                                            "flex items-center justify-center gap-1 font-black text-sm",
                                            m.movementType === 'IN' ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {m.movementType === 'IN' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                            {m.quantity}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-slate-400 text-xs line-through">{m.oldQuantity}</span>
                                            <span className="text-indigo-600 font-black text-sm">{m.newQuantity}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-xs font-bold text-slate-500 max-w-50 truncate">
                                            {m.reason}
                                        </p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-xs font-bold text-slate-600">{m.performedBy?.name}</span>
                                            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                                <User size={14} />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
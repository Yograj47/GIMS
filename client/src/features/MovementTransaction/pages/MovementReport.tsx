import { Search, Calendar, Users, ArrowDownLeft, ArrowUpRight, Download, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMovementTransactions } from "../hooks/useMovementTransactions";
import { useEffect } from "react";
import { Loading } from "@/lib/loader";

export default function StockMovementReport() {
    const { fetchMovements, movements, isLoading } = useMovementTransactions();

    useEffect(() => {
        fetchMovements();
    }, [fetchMovements]);

    return (
        <div className="min-h-full space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Stock Movement Report</h1>
                    <p className="text-sm font-medium text-slate-500 italic">Detailed history of all incoming and outgoing inventory</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 font-bold text-xs gap-2 h-11 shadow-sm transition-all">
                    <Download size={16} /> Export CSV
                </Button>
            </div>

            {/* Advanced Filter Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Search Product</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input placeholder="Search..." className="pl-9 h-10 bg-slate-50/50 border-slate-200 rounded-xl text-sm" />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Date Range</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select className="w-full h-10 bg-slate-50/50 border border-slate-200 rounded-xl pl-9 pr-3 text-sm font-medium text-slate-600 outline-none">
                            <option>This Month</option>
                            <option>Last 7 Days</option>
                            <option>Custom Range</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">User Role</label>
                    <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select className="w-full h-10 bg-slate-50/50 border border-slate-200 rounded-xl pl-9 pr-3 text-sm font-medium text-slate-600 outline-none">
                            <option>All Users</option>
                            <option>Admin</option>
                            <option>Shopkeeper</option>
                        </select>
                    </div>
                </div>
                <div className="flex items-end">
                    <Button variant="outline" className="w-full h-10 rounded-xl border-slate-200 text-slate-600 font-bold text-xs gap-2">
                        <Filter size={14} /> Clear Filters
                    </Button>
                </div>
            </div>

            {/* Movement Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4 text-center">Type</th>
                            <th className="px-6 py-4 text-center">Quantity</th>
                            <th className="px-6 py-4">Reason</th>
                            <th className="px-6 py-4 text-right">Performed By</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {
                            movements.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-sm font-medium text-slate-500">
                                        No movement transactions found.
                                    </td>
                                </tr>
                            )
                        }
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-10">
                                    <Loading />
                                </td>
                            </tr>) :
                            (
                                movements.map((item, idx) => (
                                        <tr key={item._id || idx} className="group hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-5 text-xs font-mono font-medium text-slate-400">
                                                {/* Convert ISO string to readable date */}
                                                {new Date(item.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-5">
                                                {/* Access the populated product name */}
                                                <span className="text-sm font-bold text-slate-700">
                                                    {item.productId?.name || "Unknown Product"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex justify-center">
                                                    <div className={cn(
                                                        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight",
                                                        item.movementType === 'IN' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                                    )}>
                                                        {item.movementType === 'IN' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                                                        Stock {item.movementType}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center text-sm font-black text-slate-900">
                                                {/* Display the quantity with the unit name if available */}
                                                {item.quantity} {item.unitId?.name}
                                            </td>
                                            <td className="px-6 py-5">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none font-bold text-[10px] py-0.5">
                                                    {item.reason}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black">
                                                        {/* Use the populated user name for the avatar */}
                                                        {(item.performedBy?.name || "U").charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-600">
                                                        {item.performedBy?.name || "System"}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                            )}
                    </tbody>
                </table>

                {/* Pagination Footer */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page 1 of 2 (20 total)</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-9 w-9 rounded-xl border-slate-200 p-0 text-slate-400" disabled>
                            <ChevronLeft size={18} />
                        </Button>
                        <Button size="sm" className="h-9 w-9 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-md shadow-indigo-100">
                            1
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 w-9 rounded-xl border-slate-200 text-slate-600 font-black text-xs hover:bg-white hover:text-indigo-600">
                            2
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 w-9 rounded-xl border-slate-200 p-0 text-slate-600 hover:bg-white hover:text-indigo-600">
                            <ChevronRight size={18} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
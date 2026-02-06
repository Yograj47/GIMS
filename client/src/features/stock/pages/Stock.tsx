import { Search, Download, ChevronLeft, ChevronRight, Package, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function StockReport() {
    // Mock data based on your requirements
    const stockData = [
        { id: 1, name: "Basmati Rice", category: "Grains", stock: "150 kg", threshold: 50, lastUpdated: "2025-01-15" },
        { id: 2, name: "Wheat Flour", category: "Grains", stock: "80 kg", threshold: 40, lastUpdated: "2025-01-14" },
        { id: 3, name: "Refined Oil", category: "Oils", stock: "30 L", threshold: 50, lastUpdated: "2025-01-13" },
    ];

    return (
        <div className="min-h-full space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Stock Report</h1>
                    <p className="text-sm font-medium text-slate-500 italic">Comprehensive view of current inventory status</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 font-bold text-xs gap-2 h-11 shadow-sm transition-all">
                    <Download size={16} /> Export Report
                </Button>
            </div>

            {/* Filter Bar - Professional Slate Style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Search Product</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input placeholder="Search products..." className="pl-9 h-10 bg-slate-50/50 border-slate-200 rounded-xl text-sm focus-visible:ring-indigo-500" />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Category</label>
                    <select className="w-full h-10 bg-slate-50/50 border border-slate-200 rounded-xl px-3 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20">
                        <option>All Categories</option>
                        <option>Grains</option>
                        <option>Oils</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Date Range</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select className="w-full h-10 bg-slate-50/50 border border-slate-200 rounded-xl pl-9 pr-3 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20">
                            <option>All Time</option>
                            <option>Last 7 Days</option>
                            <option>This Month</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stock Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4 text-center">Category</th>
                            <th className="px-6 py-4 text-center">Stock</th>
                            <th className="px-6 py-4 text-center">Threshold</th>
                            <th className="px-6 py-4">Last Updated</th>
                            <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {stockData.map((item) => (
                            <tr key={item.id} className="group hover:bg-slate-50/30 transition-colors">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                            <Package size={16} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{item.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <Badge variant="outline" className="rounded-lg border-slate-200 text-slate-500 font-bold text-[10px]">
                                        {item.category}
                                    </Badge>
                                </td>
                                <td className="px-6 py-5 text-center text-sm font-black text-slate-900">{item.stock}</td>
                                <td className="px-6 py-5 text-center text-sm font-bold text-slate-400">{item.threshold}</td>
                                <td className="px-6 py-5 text-xs font-mono font-medium text-slate-400">{item.lastUpdated}</td>
                                <td className="px-6 py-5 text-right">
                                    {parseInt(item.stock) <= item.threshold ? (
                                        <span className="inline-flex items-center gap-1.5 text-rose-500 text-[10px] font-black uppercase">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                            Low Stock
                                        </span>
                                    ) : (
                                        <span className="text-emerald-500 text-[10px] font-black uppercase">Healthy</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Footer - Standardized with other pages */}
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
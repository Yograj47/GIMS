import { Search, Download, ChevronLeft, ChevronRight, Package, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/features/products/hooks/useProducts";
import { Loading } from "@/lib/loader";
import { useNavigate } from "react-router-dom"; // Assuming you use react-router
import { useEffect } from "react";

export default function StockReport() {
    const { fetchProducts, products, isLoading } = useProducts();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

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

            {/* Filter Bar */}
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
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Stock Status</label>
                    <select className="w-full h-10 bg-slate-50/50 border border-slate-200 rounded-xl px-3 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20">
                        <option>All Items</option>
                        <option>Low Stock</option>
                        <option>Healthy</option>
                    </select>
                </div>
            </div>

            {/* Stock Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4 text-center">Category</th>
                            <th className="px-6 py-4 text-center">Current Stock</th>
                            <th className="px-6 py-4 text-center">Threshold</th>
                            <th className="px-6 py-4 text-right">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="py-20 text-center"><Loading /></td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-10 text-center text-slate-400 text-sm">No products found</td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product._id} className="group hover:bg-slate-50/30 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                <Package size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700">{product.name}</span>
                                                <span className="text-[10px] text-slate-400 uppercase font-bold">{product.unit?.name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <Badge variant="outline" className="rounded-lg border-slate-200 text-slate-500 font-bold text-[10px]">
                                            {product.category?.name}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-5 text-center text-sm font-black text-slate-900">
                                        {product.quantity}
                                    </td>
                                    <td className="px-6 py-5 text-center text-sm font-bold text-slate-400">
                                        {product.threshold}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        {product.quantity <= product.threshold ? (
                                            <span className="inline-flex items-center gap-1.5 text-rose-500 text-[10px] font-black uppercase">
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                                Low Stock
                                            </span>
                                        ) : (
                                            <span className="text-emerald-500 text-[10px] font-black uppercase">Healthy</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-8 px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1 font-bold text-[10px] uppercase"
                                            onClick={() => navigate(`/reports/stock/product-history/${product._id}`)}
                                        >
                                            <History size={14} /> View History
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination Footer */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Total Products: {products.length}
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-9 w-9 rounded-xl border-slate-200 p-0 text-slate-400" disabled>
                            <ChevronLeft size={18} />
                        </Button>
                        <Button size="sm" className="h-9 w-9 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-md shadow-indigo-100">1</Button>
                        <Button variant="outline" size="sm" className="h-9 w-9 rounded-xl border-slate-200 p-0 text-slate-600">
                            <ChevronRight size={18} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
import { Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Alert() {
    // Mock data based on your screenshot
    const lowStockItems = [
        { id: 1, name: "Refined Oil", current: "30 L", threshold: "50 L", status: "Critical" },
        { id: 2, name: "Salt", current: "45 kg", threshold: "100 kg", status: "Warning" },
    ];

    return (
        <div className="min-h-full space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Alerts</h1>
                <p className="text-sm font-medium text-slate-500">Monitor and resolve inventory issues</p>
            </div>

            {/* Summary Stat Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-sm">
                <div className="flex items-center gap-3 text-blue-600 mb-2">
                    <Package size={20} strokeWidth={2.5} />
                    <h2 className="font-bold text-sm uppercase tracking-wider">Low Stock Items</h2>
                </div>
                <div className="space-y-1">
                    <span className="text-4xl font-black text-slate-900">{lowStockItems.length}</span>
                    <p className="text-xs font-bold text-slate-400 uppercase">Items below threshold</p>
                </div>
            </div>

            {/* Alerts Table Card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-1">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/80">
                            <tr className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Current Stock</th>
                                <th className="px-6 py-4">Threshold</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {lowStockItems.map((item) => (
                                <tr key={item.id} className="text-sm font-bold text-slate-700 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">{item.name}</td>
                                    <td className="px-6 py-4 text-slate-900">{item.current}</td>
                                    <td className="px-6 py-4 text-slate-400 font-medium">{item.threshold}</td>
                                    <td className="px-6 py-4">
                                        <Badge 
                                            variant="secondary" 
                                            className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase ${
                                                item.status === 'Critical' 
                                                ? 'bg-rose-100 text-rose-600' 
                                                : 'bg-amber-100 text-amber-600'
                                            }`}
                                        >
                                            {item.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="rounded-xl border-slate-200 font-bold text-xs hover:bg-blue-50 hover:text-blue-600 transition-all"
                                        >
                                            Resolve <ArrowRight size={14} className="ml-1" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
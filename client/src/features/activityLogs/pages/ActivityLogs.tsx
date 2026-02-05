import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ActivityLogs() {
  // Mock data based on your uploaded images
  const logs = [
    { id: 1, action: "Sale - Transaction TXN001 created for Rs 1500", doneBy: "Shopkeeper", type: "Sale", timestamp: "2025-01-18 14:30:45" },
    { id: 2, action: "Purchase - Transaction TXN002 created for Rs 8200", doneBy: "Admin", type: "Purchase", timestamp: "2025-01-18 13:15:20" },
    { id: 3, action: "Product Updated - Basmati Rice (Price changed: 80 -> 85)", doneBy: "Admin", type: "Update", timestamp: "2025-01-18 12:45:10" },
    { id: 4, action: "Product Deleted - Old Spices (ID: P-0015)", doneBy: "Admin", type: "Delete", timestamp: "2025-01-18 11:20:30" },
    { id: 5, action: "Transaction TXN001 - Credit Settlement marked as Settled", doneBy: "Admin", type: "Settlement", timestamp: "2025-01-17 14:20:10" },
  ];

  // Helper to color-code types based on your UI
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'Sale': return 'bg-blue-100 text-blue-600';
      case 'Purchase': return 'bg-emerald-100 text-emerald-600';
      case 'Update': return 'bg-purple-100 text-purple-600';
      case 'Delete': return 'bg-rose-100 text-rose-600';
      case 'Settlement': return 'bg-amber-100 text-amber-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="min-h-full space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Activity Logs</h1>
          <p className="text-sm font-medium text-slate-500">System-wide audit trail for every action</p>
        </div>
        <Button variant="outline" className="rounded-xl font-bold text-xs gap-2 border-slate-200">
          <Download size={16} /> Export CSV
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search by action, user, or transaction ID..." 
            className="pl-10 h-12 rounded-xl border-slate-200 font-medium"
          />
        </div>
        <select className="w-48 h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none">
          <option>All Types</option>
          <option>Sale</option>
          <option>Purchase</option>
          <option>Update</option>
          <option>Delete</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/80">
            <tr className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Done By</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {logs.map((log) => (
              <tr key={log.id} className="text-sm font-bold text-slate-700 hover:bg-slate-50/30 transition-colors">
                <td className="px-6 py-5 max-w-md">{log.action}</td>
                <td className="px-6 py-5 text-slate-500">{log.doneBy}</td>
                <td className="px-6 py-5">
                  <Badge className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase border-none ${getTypeStyles(log.type)}`}>
                    {log.type}
                  </Badge>
                </td>
                <td className="px-6 py-5 text-slate-400 font-medium text-xs font-mono">{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Page 1 of 2 (20 total)</span>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-lg h-8 font-bold text-xs" disabled>Previous</Button>
                <Button variant="outline" size="sm" className="rounded-lg h-8 font-bold text-xs bg-slate-900 text-white border-slate-900">1</Button>
                <Button variant="outline" size="sm" className="rounded-lg h-8 font-bold text-xs">2</Button>
                <Button variant="outline" size="sm" className="rounded-lg h-8 font-bold text-xs">Next</Button>
            </div>
        </div>
      </div>
    </div>
  );
}
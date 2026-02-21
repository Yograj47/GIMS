import { useNavigate } from 'react-router-dom';
import { Download, Upload, ArrowRightLeft, History } from 'lucide-react';

export default function StockManagement() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Stock In",
      description: "Record incoming stock from suppliers or manual adjustments",
      icon: <Download className="text-blue-600" size={32} />,
      path: "/stock-movements/form?mode=in",
      color: "bg-blue-50",
      accent: "border-blue-100"
    },
    {
      title: "Stock Out",
      description: "Record outgoing stock for sales, damage, or returns",
      icon: <Upload className="text-rose-600" size={32} />,
      path: "/stock-movements/form?mode=out",
      color: "bg-rose-50",
      accent: "border-rose-100"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-blue-600 mb-1">
          <ArrowRightLeft size={16} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Inventory Management</span>
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Stock Movement</h1>
        <p className="text-slate-500 font-medium">Log inventory flow to keep your stock levels accurate.</p>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {actions.map((action) => (
          <button
            key={action.title}
            onClick={() => navigate(action.path)}
            className={`group relative bg-white border ${action.accent} rounded-[2rem] p-8 text-left transition-all hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 active:scale-[0.98] border-b-4`}
          >
            <div className={`w-16 h-16 ${action.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300`}>
              {action.icon}
            </div>
            
            <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight flex items-center gap-2">
              {action.title}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed font-medium mb-4">
              {action.description}
            </p>

            <div className="flex items-center text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors uppercase tracking-widest">
              Open Form <ArrowRightLeft size={14} className="ml-2" />
            </div>
          </button>
        ))}
      </div>

      {/* Subtle Footer Link */}
      <div 
        onClick={() => navigate('/reports/stock')}
        className="group flex items-center justify-between bg-white border-blue-200 hover:border-blue-400 cursor-pointer border rounded-2xl p-5 transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm transition-colors">
            <History size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">Audit Trail</p>
            <p className="text-xs text-slate-400 font-medium">Review history of all movements</p>
          </div>
        </div>
        <span className="text-blue-600 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">View Logs</span>
      </div>
    </div>
  );
}
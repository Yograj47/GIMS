import { useNavigate } from 'react-router-dom';
import { Download, Upload, ArrowRightLeft } from 'lucide-react';

export default function StockManagement() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Stock In",
      description: "Record incoming stock from suppliers or manual adjustments",
      icon: <Download className="text-blue-600" size={32} />,
      path: "/movement/form?mode=in",
      color: "bg-blue-50",
    },
    {
      title: "Stock Out",
      description: "Record outgoing stock for sales, damage, or returns",
      icon: <Upload className="text-rose-600" size={32} />,
      path: "/movement/form?mode=out",
      color: "bg-rose-50",
    }
  ];

  return (
    <div className="space-y-4 max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-slate-400">
           <ArrowRightLeft size={16} />
           <span className="text-[10px] font-black uppercase tracking-[0.2em]">Inventory Flow</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Stock Movement</h1>
        <p className="text-slate-500 font-medium">Select an action to manage your inventory levels</p>
      </div>

      {/* Grid Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {actions.map((action) => (
          <button
            key={action.title}
            onClick={() => navigate(action.path)}
            className="group relative bg-white border border-slate-200 rounded-[2.5rem] p-10 text-center transition-all hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 active:scale-[0.98]"
          >
            <div className={`mx-auto w-20 h-20 ${action.color} rounded-3xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-6`}>
              {action.icon}
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
              {action.title}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-60 mx-auto font-medium">
              {action.description}
            </p>

            <div className="mt-8 inline-flex items-center justify-center w-12 h-12 rounded-full border border-slate-100 text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
               <ArrowRightLeft size={20} />
            </div>
          </button>
        ))}
      </div>

      {/* Quick Stats/Info Footer */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600">
            <ArrowRightLeft size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Activity</p>
            <p className="text-sm font-bold text-slate-700">View detailed stock history in Reports</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/reports')}
          className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline"
        >
          View Full Log
        </button>
      </div>
    </div>
  );
}
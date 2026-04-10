import { useNavigate } from 'react-router-dom';
import { Download, Upload, History, ChevronRight, Activity } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAnalytics } from '@/features/dashboard/hooks/useAnalystics';
import { useEffect } from 'react';
import { Loading } from '@/lib/loader';

export default function StockManagement() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Stock Inflow",
      code: "STR-IN",
      description: "Document incoming units: Supplier deliveries, manufacturing output, or manual overrides.",
      icon: <Download size={18} />,
      path: "/stock-movements/form?mode=in",
      accent: "text-blue-600",
      border: "hover:border-blue-400",
      bg: "bg-blue-50/30"
    },
    {
      title: "Stock Outflow",
      code: "STR-OUT",
      description: "Document outgoing units: Customer fulfillment, damage write-offs, or vendor returns.",
      icon: <Upload size={18} />,
      path: "/stock-movements/form?mode=out",
      accent: "text-rose-600",
      border: "hover:border-rose-400",
      bg: "bg-rose-50/30"
    }
  ];

  const { fetchSummary, summary, isLoading } = useAnalytics();

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary])

  if (isLoading) return <Loading fullPage />

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-500">

      {/* --- TOP NAV --- */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">v1.0.0</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Inventory Control System</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Stock Movements</h1>
        </div>

        <button
          onClick={() => navigate('/reports/stock')}
          className="h-10 px-4 flex items-center gap-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all group"
        >
          <History size={14} className="text-slate-400 group-hover:text-indigo-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-indigo-600">Movement Logs</span>
        </button>
      </div>

      {/* --- MAIN ACTION GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {actions.map((action) => (
          <button
            key={action.title}
            onClick={() => navigate(action.path)}
            className={cn(
              "group relative bg-white border border-slate-300 rounded-xl p-6 text-left transition-all overflow-hidden",
              "hover:shadow-md active:scale-[0.99]",
              action.border
            )}
          >
            <div className="absolute -right-4 -top-4 opacity-[0.03] rotate-12 transition-transform group-hover:scale-110">
              {action.icon}
              <span className="text-8xl font-black">{action.code.split('-')[1]}</span>
            </div>

            <div className="flex items-start justify-between mb-6">
              <div className={cn("w-10 h-10 rounded-lg border flex items-center justify-center shadow-sm", action.bg, action.accent, "border-current/10")}>
                {action.icon}
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">{action.code}</span>
            </div>

            <div className="space-y-1 mb-4">
              <h2 className="text-xl text-slate-900 tracking-tight uppercase italic">{action.title}</h2>
              <div className="h-0.5 w-8 bg-slate-900 group-hover:w-16 transition-all duration-300" />
            </div>

            <p className="text-[11px] text-slate-500 font-bold leading-relaxed mb-8 pr-12 uppercase tracking-tight">
              {action.description}
            </p>

            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">
              Execute Module <ChevronRight size={12} strokeWidth={3} />
            </div>
          </button>
        ))}
      </div>

      {/* --- SYSTEM MONITORING BAR --- */}
      <div className="border border-slate-300 rounded-xl bg-slate-50/50 p-2 flex flex-col md:flex-row gap-2">
        <MonitorCard label="Total Movements (24h)" value={String(summary?.todayFlow.value)} />
        <MonitorCard label="Critical Low Stock" value={String(summary?.lowItems)} isWarning />
        <MonitorCard label="Database Sync" value="Operational" isStatus />
      </div>
    </div>
  );
}

function MonitorCard({ label, value, isWarning, isStatus }: { label: string, value: string, isWarning?: boolean, isStatus?: boolean }) {
  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Activity size={12} className="text-slate-300" />
        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
      </div>
      <span className={cn(
        "text-[10px] font-mono font-black",
        isWarning ? "text-rose-500" : isStatus ? "text-emerald-500" : "text-slate-700"
      )}>
        {value}
      </span>
    </div>
  );
}
import { BarChart3, ArrowRightLeft, FileText, ClipboardList, ChevronRight, ChartBar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuth";

const REPORT_CONFIG = [
  {
    title: "Stock Report",
    description: "Inventory levels, valuation, and threshold analysis.",
    icon: BarChart3,
    path: "/reports/stock",
    color: "text-blue-600",
    bg: "bg-blue-50",
    roles: ['admin', 'owner', 'staff']
  },
  {
    title: "Transaction Report",
    description: "Audit ledger for sales, purchases, and settlements.",
    icon: FileText,
    path: "/reports/transactions",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    roles: ['admin', 'owner', 'staff']
  },
  {
    title: "Movement Report",
    description: "Full traceability of stock adjustments and transfers.",
    icon: ArrowRightLeft,
    path: "/reports/movement",
    color: "text-amber-600",
    bg: "bg-amber-50",
    roles: ['admin', 'owner']
  },
  {
    title: "Activity Logs",
    description: "System-wide audit trail and user action history.",
    icon: ClipboardList,
    path: "/reports/activity",
    color: "text-slate-600",
    bg: "bg-slate-50",
    roles: ['admin', 'owner']
  },
];

export default function ReportsHub() {
  const navigate = useNavigate();
  const {user} = useAuthStore();

  const filteredReports = REPORT_CONFIG.filter(report => report.roles.includes(user?.role.toLowerCase() || ""));

  return (
    <div className="h-full animate-in fade-in duration-700 px-6 py-6">
      <div className="max-w-400 mx-auto space-y-8">

        {/* --- 1. PRECISION HEADER --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-8">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600 rounded-sm text-white transition-transform hover:rotate-3">
              <ChartBar size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
                Reports Hub
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Data Intelligence • <span className="text-blue-600 italic font-black">Ready</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-sm shadow-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Secure Node</span>
          </div>
        </div>

        {/* --- 2. SMOOTH REPORT GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredReports.map((report) => (
            <div
              key={report.path}
              onClick={() => navigate(report.path)}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-sm border border-slate-200 bg-white transition-all duration-300 ease-out",
                "hover:border-slate-400 hover:shadow-[4px_4px_20px_-10px_rgba(0,0,0,0.1)]"
              )}
            >
              <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-blue-600 -translate-x-0.75 group-hover:translate-x-0 transition-transform duration-300" />

              <div className="flex items-stretch h-28">
                <div className={cn(
                  "flex w-20 items-center justify-center border-r border-slate-100 transition-colors duration-500",
                  "bg-slate-50/50 text-slate-400 group-hover:bg-slate-100 group-hover:text-blue-600"
                )}>
                  <report.icon 
                    size={22} 
                    strokeWidth={1.5} 
                    className="transition-transform duration-500 group-hover:scale-110" 
                  />
                </div>

                {/* CONTENT AREA */}
                <div className="flex flex-1 flex-col justify-center px-6 transition-transform duration-300 group-hover:translate-x-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[14px] font-black uppercase tracking-tight text-slate-900 transition-colors group-hover:text-blue-600">
                      {report.title}
                    </h3>
                    <ChevronRight
                      size={14}
                      className="opacity-0 -translate-x-2 text-blue-600 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                      strokeWidth={3}
                    />
                  </div>
                  <p className="max-w-60 text-[12px] font-medium leading-tight text-slate-500 tracking-tight">
                    {report.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- 3. FOOTER --- */}
        <div className="pt-8 border-t border-slate-200 flex justify-between items-center opacity-60">
          <p className="text-[9px] font-black text-slate-800 uppercase tracking-[0.3em]">
            Core.Analytical_Services
          </p>
          <p className="text-[9px] font-mono font-bold text-slate-800 uppercase tracking-tighter">
            Build_ID: 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
"use client";

import { BarChart3, ArrowRightLeft, FileText, ClipboardList, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const REPORT_CONFIG = [
  {
    title: "Stock Report",
    description: "Detailed breakdown of current inventory and valuation.",
    icon: BarChart3,
    path: "/reports/stock",
  },
  {
    title: "Transaction Report",
    description: "Audit sales, purchases, and settlement statuses.",
    icon: FileText,
    path: "/reports/transactions",
  },
  {
    title: "Movement Report",
    description: "Trace every stock adjustment and transfer history.",
    icon: ArrowRightLeft,
    path: "/reports/movement",
  },
  {
    title: "Activity Logs",
    description: "Monitor user actions and system-wide changes.",
    icon: ClipboardList,
    path: "/reports/activity",
  },
];

export default function ReportsHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* THEMED HEADER */}
      <div className="flex justify-between items-end border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            Analytics Hub<span className="text-blue-600">.</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data Intelligence & Reporting</p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORT_CONFIG.map((report) => (
          <Card 
            key={report.path} 
            onClick={() => navigate(report.path)}
            className={cn(
              "group relative cursor-pointer border-slate-200 bg-white transition-all duration-200",
              "hover:border-blue-600/30 hover:shadow-md",
              "rounded-2xl overflow-hidden"
            )}
          >
            <CardContent className="p-6 flex items-center gap-5">
              {/* Icon Wrapper - Transitions to Blue-600 */}
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm",
                "bg-slate-50 text-slate-900",
                "group-hover:bg-blue-600 group-hover:text-white group-hover:-rotate-2"
              )}>
                <report.icon 
                  size={24} 
                  strokeWidth={2.5}
                />
              </div>

              {/* Text Content */}
              <div className="flex-1 space-y-0.5">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                  {report.title}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed max-w-60">
                  {report.description}
                </p>
              </div>

              {/* Indicator */}
              <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                <ChevronRight size={18} strokeWidth={3} />
              </div>
            </CardContent>
            
            {/* Bottom Accent Line - Blue-600 */}
            <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 bg-blue-600" />
          </Card>
        ))}
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
          Terminal Status: Ready
        </p>
        <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tighter">
                System Online
            </p>
        </div>
      </div>
    </div>
  );
}
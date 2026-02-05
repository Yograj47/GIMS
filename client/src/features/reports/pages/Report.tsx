import { BarChart3, ArrowRightLeft, FileText, ClipboardList, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// 1. Configuration moved outside for better maintainability
const REPORT_CONFIG = [
  {
    title: "Stock Report",
    description: "Detailed breakdown of current inventory and valuation.",
    icon: BarChart3,
    path: "/reports/stock",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50/50",
  },
  {
    title: "Transaction Report",
    description: "Audit sales, purchases, and settlement statuses.",
    icon: FileText,
    path: "/reports/transactions",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50/50",
  },
  {
    title: "Movement Report",
    description: "Trace every stock adjustment and transfer history.",
    icon: ArrowRightLeft,
    path: "/reports/movement",
    color: "text-violet-600",
    bgColor: "bg-violet-50/50",
  },
  {
    title: "Activity Logs",
    description: "Monitor user actions and system-wide changes.",
    icon: ClipboardList,
    path: "/reports/activity",
    color: "text-amber-600",
    bgColor: "bg-amber-50/50",
  },
];

export default function ReportsHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header Section */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reports</h1>
        <p className="text-sm font-medium text-slate-500">
          Select a specialized module to view your business analytics
        </p>
      </div>

      {/* Grid Layout - Improved Spacing and Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {REPORT_CONFIG.map((report) => (
          <Card 
            key={report.path} 
            onClick={() => navigate(report.path)}
            className={cn(
              "group relative cursor-pointer border-slate-200 bg-white transition-all duration-300",
              "hover:border-indigo-500/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1",
              "rounded-2xl overflow-hidden"
            )}
          >
            <CardContent className="p-7 flex items-center gap-6">
              {/* Icon Wrapper - Professional Soft Backgrounds */}
              <div className={cn(
                "p-4 rounded-2xl transition-all duration-500",
                report.bgColor,
                "group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white"
              )}>
                <report.icon 
                  className={cn("transition-colors duration-500", report.color, "group-hover:text-white")} 
                  size={26} 
                  strokeWidth={2.5}
                />
              </div>

              {/* Text Content */}
              <div className="flex-1 space-y-1">
                <h3 className="text-lg font-bold text-slate-800 transition-colors group-hover:text-indigo-600">
                  {report.title}
                </h3>
                <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-50">
                  {report.description}
                </p>
              </div>

              {/* Subtle Arrow Indicator */}
              <ChevronRight 
                className="text-slate-300 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1" 
                size={20} 
              />
            </CardContent>

            {/* Subtle bottom accent line on hover */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Card>
        ))}
      </div>
    </div>
  );
}
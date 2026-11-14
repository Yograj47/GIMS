import { BarChart3, ArrowRightLeft, FileText, ClipboardList, ChevronRight, ChartBar, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

const REPORT_CONFIG = [
  {
    title: "Accounting Report",
    description: "Posted debits, credits, and inventory costs awaiting reconciliation.",
    icon: BookOpen,
    path: "/reports/accounting",
    color: "text-link",
    bg: "bg-brand-50",
    roles: ["admin", "owner", "accountant"]
  },
  {
    title: "Stock Report",
    description: "Inventory levels, low-stock warnings, and stock reconciliation.",
    icon: BarChart3,
    path: "/reports/stock",
    color: "text-link",
    bg: "bg-brand-50",
    roles: ['admin', 'owner']
  },
  {
    title: "Transaction Report",
    description: "Sales by channel, transaction details, and sales invoices.",
    icon: FileText,
    path: "/reports/transactions",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    roles: ['admin', 'owner', 'accountant']
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
    color: "text-muted-foreground",
    bg: "bg-muted",
    roles: ['admin']
  },
];

export default function ReportsHub() {
  const role = useAuthStore((state) => state.user?.role);
  const reports = REPORT_CONFIG.filter((report) => role && report.roles.includes(role));

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3 border-b border-border pb-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-100 text-link">
          <ChartBar size={19} aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review sales, stock movements, and accounting.</p>
        </div>
      </header>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {reports.map(({ path, icon: Icon, title, description, color, bg }) => (
          <Link key={path} to={path} className="group flex min-w-0 items-start gap-3 rounded-xl border border-border bg-card p-4 hover:border-brand-300 hover:bg-brand-50 sm:p-5">
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", color, bg)}>
              <Icon size={19} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-foreground">{title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
            <ChevronRight size={17} aria-hidden="true" className="mt-1 shrink-0 text-link" />
          </Link>
        ))}
      </div>
    </div>
  );
}

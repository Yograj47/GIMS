import {
  ArrowLeft,
  Store,
  LayoutGrid,
  Ruler,
  Calculator,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function SettingsLayout() {
  const navigate = useNavigate();

  const menuItems = [
    { id: "general", label: "General", path: "/settings", icon: Store, exact: true },
    { id: "categories", label: "Categories", path: "/settings/categories", icon: LayoutGrid },
    { id: "units", label: "Units", path: "/settings/units", icon: Ruler },
    { id: "uoms", label: "UOM", path: "/settings/uoms", icon: Calculator },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* ---------- THEMED SIDEBAR ---------- */}
      {/* Changed bg-slate-100 to a cleaner slate-50/white mix and softened borders */}
      <aside className="w-64 shrink-0 border-r-2 border-slate-200 flex flex-col bg-white">
        {/* Header */}
        <div className="px-6 pt-8 pb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-6 group"
          >
            <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Store</span>
          </button>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Settings</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all border-2",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                      : "text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-900"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cn(
                      "p-1.5 rounded-lg border-2 transition-colors",
                      isActive ? "bg-blue-600 text-white border-blue-600" : "bg-slate-100 text-slate-400 border-slate-200"
                    )}>
                      <Icon size={16} strokeWidth={2.5} />
                    </span>
                    <span className="tracking-tight uppercase text-[11px]">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Badge - Refined to match the lighter theme */}
        <div className="p-4 border-t-2 border-slate-100">
          <div className="flex items-center gap-3 p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl">
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-[12px] font-black">A</div>
            <div>
              <p className="text-[10px] font-black text-slate-900 leading-none">ADMIN PANEL</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">System Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ---------- MAIN CONTENT AREA ---------- */}
      <main className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
        <div className="flex-1 flex flex-col px-10 py-8 overflow-hidden">
          <div className="max-w-350 w-full mx-auto flex flex-col h-full min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
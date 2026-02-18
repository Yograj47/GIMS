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
    <div className="flex h-screen bg-white overflow-hidden">

      {/* ---------- SHARP SETTINGS SIDEBAR ---------- */}
      {/* Increased border-r weight and changed background to a solid slate-100 */}
      <aside className="w-60 shrink-0 border-r-2 border-slate-500 flex flex-col bg-slate-100">

        {/* Header */}
        <div className="px-6 pt-8 pb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 group"
          >
            {/* Thicker Icon Stroke */}
            <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Back to Store
            </span>
          </button>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Settings</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-black transition-all duration-200 border-2",
                    isActive
                      ? "bg-white text-slate-900 border-slate-900 "
                      : "text-slate-600 border-transparent hover:bg-white/50 hover:text-slate-900"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "p-1.5 rounded-lg border-2 transition-colors",
                        isActive
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-200 text-slate-500 border-slate-300"
                      )}
                    >
                      <Icon size={16} strokeWidth={2.5} />
                    </span>

                    <span className="tracking-tight uppercase text-[12px]">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Badge - Darkened to match your Admin theme */}
        <div className="p-4 border-t-2 border-slate-200">
          <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-2xl shadow-xl">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[12px] font-black ring-2 ring-white/20">
              A
            </div>

            <div>
              <p className="text-[11px] font-black text-white leading-none tracking-tight">
                ADMIN PANEL
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">
                System Manager
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ---------- CONTENT AREA ---------- */}
      <main className="flex-1 min-w-0 flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto w-full">
            <div className="max-w-6xl mx-auto py-12 px-10">
                <Outlet />
            </div>
        </div>
      </main>
    </div>
  );
}
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
    <div className="flex min-h-screen bg-white overflow-hidden">

      {/* ---------- SMALL SETTINGS SIDEBAR ---------- */}
      <aside className="w-56 shrink-0 border-r border-slate-100 flex flex-col bg-slate-50/60">

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-6 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-wider">
              Back
            </span>
          </button>

          <h1 className="text-xl font-black text-slate-800">Settings</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
                    isActive
                      ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:bg-white hover:text-slate-800"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "p-1.5 rounded-md",
                        isActive
                          ? "bg-indigo-50 text-indigo-600"
                          : "bg-slate-100 text-slate-400"
                      )}
                    >
                      <Icon size={16} />
                    </span>

                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Badge */}
        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-[10px] font-black">
              A
            </div>

            <div>
              <p className="text-[10px] font-black text-white leading-none">
                Admin
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">
                Full Access
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ---------- CONTENT AREA (WIDER) ---------- */}
      <main className="flex-1 min-w-0 flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto py-10 px-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Store, LayoutGrid, Ruler, Calculator, ShieldCheck, Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [screen, setScreen] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // Responsive logic matched to AppLayout
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 768) setScreen("mobile");
      else if (w < 1024) setScreen("tablet");
      else setScreen("desktop");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const collapsed = screen === "desktop" ? !sidebarOpen : true;

  const menuItems = [
    { id: "general", label: "General Registry", path: "/settings", icon: Store, exact: true },
    { id: "categories", label: "Category Management", path: "/settings/categories", icon: LayoutGrid },
    { id: "units", label: "Measurement Units", path: "/settings/units", icon: Ruler },
    { id: "uoms", label: "UOM Matrix", path: "/settings/uoms", icon: Calculator },
  ];

  return (
    <div className="flex h-screen w-full bg-[#f1f5f9] overflow-hidden font-sans antialiased text-slate-900">

      {/* 1. SETTINGS SIDEBAR (Matched to App Sidebar Logic) */}
      <aside
        className={cn(
          "no-print fixed inset-y-0 left-0 z-60 bg-white border-r border-slate-200 transition-all duration-500 ease-in-out flex flex-col",
          collapsed ? "w-20" : "w-64",
          screen === "mobile" && (sidebarOpen ? "translate-x-0" : "-translate-x-full")
        )}
      >
        {/* Back to App Header */}
        <div className="p-6 border-b border-slate-50">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 text-slate-400 hover:text-blue-600 transition-colors group"
          >
            <div className="w-8 h-8 rounded-sm bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            {!collapsed && (
              <span className="text-[10px] font-black uppercase tracking-widest">Exit Settings</span>
            )}
          </button>
        </div>

        {/* Nav Nodes */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {!collapsed && (
            <p className="px-4 mb-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Configuration</p>
          )}
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.exact}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-3 rounded-sm text-[11px] font-bold transition-all group",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} strokeWidth={isActive ? 3 : 2} className="shrink-0" />
                    {!collapsed && <span className="uppercase tracking-tight">{item.label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Admin Status Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className={cn(
            "flex items-center gap-3 p-2 bg-white border border-slate-200 rounded-sm shadow-sm",
            collapsed && "justify-center px-0"
          )}>
            <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center text-white shrink-0">
              <ShieldCheck size={16} />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-900 uppercase truncate">Primary Admin</p>
                <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-tighter">Verified Access</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div
        className={cn(
          "flex flex-col flex-1 min-w-0 transition-all duration-500 ease-in-out",
          collapsed ? "ml-20" : "ml-64",
          screen === "mobile" && "ml-0"
        )}
      >
        {/* Sub-Header (Settings Title Bar) */}
        <header className="no-print h-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600 rounded-sm text-white shadow-sm">
              <Settings2 size={18} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tighter uppercase leading-none">
                System Configuration<span className="text-blue-600">.</span>
              </h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Audit Mode Active</p>
            </div>
          </div>

          {/* Optional Toggle for Sidebar - same as AppHeader */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-sm transition-colors text-slate-400"
          >
            <LayoutGrid size={18} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-350 mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
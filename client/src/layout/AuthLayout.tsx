import { Button } from "@/components/ui/button";
import { Box, ShieldCheck, Globe } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";

function AuthLayout() {
  const { pathname } = useLocation();
  const isPathHelper = pathname === "/help";

  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-slate-200 selection:bg-blue-500/30 grid grid-rows-[72px_1fr_60px] font-sans antialiased">

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* --- HEADER: Professional & Sharp --- */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-900/40 group-hover:scale-105 transition-transform">
            <Box className="w-5 h-5" />
          </div>

          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-white leading-none tracking-tight">
              Grocery<span className="text-blue-500">Pro</span>
            </h1>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
              Management Suite
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <Link to="/help" className="hover:text-white transition-colors">Support</Link>
            <Link to="/docs" className="hover:text-white transition-colors">Docs</Link>
          </nav>
          <div className="h-4 w-px bg-slate-800 hidden md:block" />
          <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/20" asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="relative flex items-center justify-center p-6 overflow-y-auto">
        <div className={`w-full ${isPathHelper ? "max-w-7xl" : "max-w-110"} relative z-10`}>
          <Outlet />
        </div>
      </main>

      {/* --- FOOTER: Clean & Corporate --- */}
      <footer className="flex items-center justify-between px-10 border-t border-slate-800 bg-[#0f172a]">
        <div className="flex items-center gap-6">
          <p className="text-[11px] text-slate-500 font-medium tracking-wide">
            &copy; {new Date().getFullYear()} GROCERY PRO SYSTEM
          </p>
          <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/5 px-2 py-1 rounded">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            System Live
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck size={14} className="text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Standard Security</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center gap-1 text-slate-500">
            <Globe size={14} />
            <span className="text-[10px] font-bold uppercase">v1.0.0</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default AuthLayout;
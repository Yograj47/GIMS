import { Button } from "@/components/ui/button";
import { Box, ShieldCheck } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    // Added a subtle radial gradient to the background for depth
    <div className="min-h-screen w-full bg-[#f8fafc] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-size-[20px_20px] grid grid-rows-[72px_1fr_60px]">

      {/* Header: Added glass effect and tighter shadows */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 bg-white/80 backdrop-blur-md border-b border-slate-200/60">

        {/* Brand: Added hover scaling for a "pro" feel */}
        <Link to="/" className="flex items-center gap-3 group transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200 group-hover:bg-blue-700 transition-colors">
            <Box className="w-5 h-5" />
          </div>

          <div className="leading-tight">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Grocery<span className="text-blue-600">Pro</span>
            </h1>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                Inventory
              </span>
              <div className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">
                v1.0
              </span>
            </div>
          </div>
        </Link>

        {/* Actions: Grouped with slightly better spacing */}
        <div className="flex items-center gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100" asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative flex items-center justify-center p-6">
        <Outlet />
      </main>

      {/* Footer: Made more minimal and professional */}
      <footer className="flex items-center justify-between px-10 border-t border-slate-200 bg-white/50">
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} Grocery Pro Inc.
        </p>
        <div className="flex items-center gap-4 text-xs text-slate-600">
          <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
          <div className="flex items-center gap-1 ml-2 text-slate-500">
            <ShieldCheck className="w-3 h-3" />
            <span className="text-[10px]">Secure System</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default AuthLayout;
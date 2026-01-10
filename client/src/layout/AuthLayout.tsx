import { Button } from "@/components/ui/button";
import { Box } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="min-h-screen w-full bg-[#f5f7f9] grid grid-rows-[72px_1fr_72px]">

      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-10 bg-white border-b">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white shadow-sm">
            <Box className="w-5 h-5" />
          </div>

          <div className="leading-tight">
            <h1 className="text-lg font-bold text-slate-900">
              Grocery<span className="text-blue-600">Pro</span>
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">
              Inventory System
            </p>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="flex items-center justify-center px-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-center text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Grocery Pro. All rights reserved.
      </footer>

    </div>
  );
}

export default AuthLayout;

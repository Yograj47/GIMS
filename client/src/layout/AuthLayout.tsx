import { Button } from "@/components/ui/button";
import { Link, Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="min-h-screen w-full bg-linear-to-br from-blue-50 to-indigo-100 grid grid-rows-[10vh_1fr_10vh]">

      {/* Header (10%) */}
      <header className="flex items-center justify-between px-8 border-b bg-white/60 backdrop-blur">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white shadow">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>

          <div className="leading-tight">
            <Link to="/">
              <h1 className="text-lg font-bold text-slate-900">
                Grocery<span className="text-blue-600">Pro</span>
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                Inventory System
              </p>
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" asChild className="shadow-0">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Main (80%) */}
      <main className="flex items-center justify-center px-4">
        <Outlet />
      </main>

      {/* Footer (10%) */}
      <footer className="flex items-center justify-center text-center">
        <p className="text-sm text-slate-400">
          © {new Date().getFullYear()} Grocery Pro. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default AuthLayout;

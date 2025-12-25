import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="min-h-screen w-full bg-linear-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-2">
     
      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <header className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200 mb-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Grocery<span className="text-blue-600">Pro</span>
          </h1>
          <p className="text-slate-500 font-medium tracking-wide uppercase text-[10px]">
            Inventory Management System
          </p>
        </header>

        {/* Main Content Card */}
        <main>
          <Outlet />
        </main>

        {/* Footer info */}
        <footer className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Grocery Pro Inc. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default AuthLayout;
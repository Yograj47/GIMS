import { Link } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { Box } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="w-full flex items-center justify-center animate-in fade-in duration-500">
      {/* Main Card - Switched to Dark Glassmorphism */}
      <div className="w-full max-w-110 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-2xl p-8 md:p-10">

        {/* Branding/Icon */}
        <div className="flex justify-center mb-8">
          <div className="p-3.5 bg-blue-600/10 rounded-2xl border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]">
            <Box className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-white tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-slate-400 font-medium">
            Enter your credentials to access <span className="text-blue-500 font-bold">GroceryPro</span>
          </p>
        </div>

        {/* Form Section */}
        <LoginForm />

        {/* Footer Link */}
        <div className="mt-10 text-center">
          <p className="text-sm text-slate-500 font-medium tracking-wide">
            New to the system?{" "}
            <Link
              to="/register"
              className="text-blue-500 font-bold hover:text-blue-400 transition-colors decoration-2 underline-offset-4 hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
import { Link } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { Box } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="w-full flex items-center justify-center">
      {/* Main Card */}
      <div className="w-full max-w-110 backdrop-blur-xl rounded-[2rem] border border-gray-300 shadow-[0_10px_40px_rgba(0,0,0,0.1)] p-8 md:p-10">

        {/* Branding/Icon - Optional but adds "UI Best" points */}
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100/50">
            <Box className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-slate-500 font-medium">
            Enter your credentials to access <span className="text-slate-900">GroceryPro</span>
          </p>
        </div>

        {/* Form Section */}
        <LoginForm />

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 font-medium">
            New to the system?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
            >
              Create free account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
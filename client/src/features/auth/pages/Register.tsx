import { Link } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function Register() {
  return (
    <div className="w-full max-w-125 bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-gray-300 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-4 md:p-10 relative overflow-hidden">
      
      {/* Back to Login */}
      <div className="mb-6">
        <Link
          to="/login"
          className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors group"
        >
          <ArrowLeft className="mr-1.5 h-3 w-3 transition-transform group-hover:-translate-x-1" />
          Back to login
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col space-y-2 mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Join <span className="text-blue-600">Pro</span>
          </h2>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Free Access
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-500 font-medium">
          Start managing your grocery inventory with <span className="text-slate-900">precision.</span>
        </p>
      </div>

      {/* Form */}
      <RegisterForm />

      {/* Small Terms Text - Good for UI trust */}
      <p className="mt-8 text-center text-[11px] text-slate-400 leading-relaxed px-4">
        By creating an account, you agree to our 
        <Link to="/terms" className="text-slate-600 font-semibold hover:underline mx-1">Terms of Service</Link> 
        and <Link to="/privacy" className="text-slate-600 font-semibold hover:underline mx-1">Privacy Policy</Link>.
      </p>
    </div>
  );
}
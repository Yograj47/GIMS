import { Link } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function Register() {
  return (
    <div className="w-full max-w-125 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-2xl p-6 md:p-10 relative overflow-hidden animate-in fade-in zoom-in duration-500">
      
      {/* Back to Login - Subtle navigation */}
      <div className="mb-8">
        <Link
          to="/login"
          className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-500 transition-colors group"
        >
          <ArrowLeft className="mr-2 h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          Back to login
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col space-y-2 mb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black tracking-tight text-white">
            Join <span className="text-blue-500">Pro</span>
          </h2>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
              Free Access
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-400 font-medium leading-relaxed">
          Start managing your grocery inventory with <span className="text-slate-200 font-bold">precision.</span>
        </p>
      </div>

      {/* Form Section */}
      <RegisterForm />

      {/* Trust Footer - Matching the dark theme */}
      <p className="mt-10 text-center text-[11px] text-slate-500 font-medium leading-relaxed px-4">
        By creating an account, you agree to our 
        <Link to="/terms" className="text-slate-300 font-bold hover:text-blue-500 transition-colors mx-1 underline-offset-4 hover:underline">Terms of Service</Link> 
        and <Link to="/privacy" className="text-slate-300 font-bold hover:text-blue-500 transition-colors mx-1 underline-offset-4 hover:underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}
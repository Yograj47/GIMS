import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff, Loader2, User, Mail, Lock, ShieldCheck } from "lucide-react";
import { registerSchema, type RegisterFormData } from "@/types/Auth";
import { useAuthStore } from "@/store/useAuth";

function RegisterForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { registerUser, isLoading } = useAuthStore();
  
  const { handleSubmit, register, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: RegisterFormData) => {
    registerUser(data);
  };

  // Refined Midnight Input Classes
  const inputClasses = (error: any) => `
    w-full rounded-xl border pl-11 pr-4 py-2.5 text-sm transition-all outline-none
    focus:ring-4 focus:ring-blue-500/10 
    ${error 
      ? 'border-red-500/50 bg-red-500/5 text-red-200 placeholder:text-red-900/50' 
      : 'border-white/5 bg-slate-950/40 text-slate-200 placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-slate-950/60'}
  `;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Full Name */}
      <div className="space-y-2">
        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Full Name</label>
        <div className="relative group">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
          <input {...register("name")} placeholder="John Doe" className={inputClasses(errors.name)} />
        </div>
        {errors.name && <p className="text-[10px] font-bold text-red-400 ml-1 uppercase tracking-tight">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email Address</label>
        <div className="relative group">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
          <input {...register("email")} placeholder="admin@grocery.local" className={inputClasses(errors.email)} />
        </div>
        {errors.email && <p className="text-[10px] font-bold text-red-400 ml-1 uppercase tracking-tight">{errors.email.message}</p>}
      </div>

      {/* Passwords Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Password</label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
            <input
              type={isPasswordVisible ? "text" : "password"}
              {...register("password")}
              placeholder="••••••••"
              className={inputClasses(errors.password)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Confirm</label>
          <div className="relative group">
            <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
            <input
              type={isPasswordVisible ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="••••••••"
              className={inputClasses(errors.confirmPassword)}
            />
            <button
              type="button"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
            >
              {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>
      
      {(errors.password || errors.confirmPassword) && (
        <p className="text-[10px] font-bold text-red-400 ml-1 uppercase tracking-tight">
          {errors.password?.message || errors.confirmPassword?.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 mt-4 text-sm font-bold transition-all active:scale-[0.98] bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 rounded-xl"
      >
        {isLoading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
}
export default RegisterForm;
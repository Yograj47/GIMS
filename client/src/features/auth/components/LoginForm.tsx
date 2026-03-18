import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/types/Auth";
import { useAuthStore } from "@/store/useAuth";

function LoginForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const { loginUser, isLoading, } = useAuthStore()

  const { handleSubmit, register, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    await loginUser(data)
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Email Field */}
      <div className="space-y-2.5">
        <label htmlFor="email" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
          Email Address
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-blue-500 transition-colors">
            <Mail size={18} />
          </div>
          <input
            id="email"
            type="email"
            {...register("email")}
            placeholder="admin@grocerypro.com"
            className={`w-full rounded-xl border pl-11 pr-4 py-3 text-sm transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10 
          ${errors.email
                ? 'border-red-500/50 bg-red-500/5 text-red-200'
                : 'border-white/5 bg-slate-950/40 text-slate-200 focus:border-blue-500/50 focus:bg-slate-950/60'}`}
          />
        </div>
        {errors.email && <p className="text-[11px] font-bold text-red-400 ml-1">{errors.email.message}</p>}
      </div>

      {/* Password Field */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between ml-1">
          <label htmlFor="password" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            Password
          </label>
          <button onClick={() => window.location.href = "/forget-password"} type="button" className="text-[11px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest">
            Forgot?
          </button>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-blue-500 transition-colors">
            <Lock size={18} />
          </div>
          <input
            id="password"
            type={isPasswordVisible ? "text" : "password"}
            {...register("password")}
            placeholder="••••••••"
            className={`w-full rounded-xl border pl-11 pr-11 py-3 text-sm transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10 
          ${errors.password
                ? 'border-red-500/50 bg-red-500/5 text-red-200'
                : 'border-white/5 bg-slate-950/40 text-slate-200 focus:border-blue-500/50 focus:bg-slate-950/60'}`}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-600 hover:text-slate-400 transition-colors"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p className="text-[11px] font-bold text-red-400 ml-1">{errors.password.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 rounded-xl mt-4 active:scale-95 transition-all"
      >
        {isLoading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Securing Session...</>
        ) : (
          "Sign In to Dashboard"
        )}
      </Button>
    </form>
  );
}

export default LoginForm;
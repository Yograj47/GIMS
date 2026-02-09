import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff, Loader2, User, Mail, Lock, ShieldCheck } from "lucide-react";
import axios from "axios";
import { useGlobalStore } from "@/store/globalStore";
import { useNavigate } from "react-router-dom";
import { notify } from "@/lib/toast";
import { registerSchema, type RegisterFormData } from "@/types/Auth";

function RegisterForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { backendUrl } = useGlobalStore();
  const navigate = useNavigate();

  const { handleSubmit, register, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${backendUrl}/auths/`, data);

      if (response?.data?.status === "success") {
        notify.success("Account created!", "Please verify your email to continue.");
        navigate("/verify");
      } else {
        notify.error(response?.data?.message || "Registration failed");
      }
    } catch (error: any) {
      notify.error(error.response?.data?.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = (error: any) => `
    w-full rounded-xl border bg-white/50 pl-11 pr-4 py-2.5 text-sm transition-all 
    focus:outline-none focus:ring-4 focus:ring-blue-500/10 
    ${error ? 'border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-blue-500 focus:bg-white'}
  `;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
        <div className="relative group">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input {...register("name")} placeholder="John Doe" className={inputClasses(errors.name)} />
        </div>
        {errors.name && <p className="text-[11px] font-medium text-red-500 ml-1">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
        <div className="relative group">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input {...register("email")} placeholder="admin@grocery.local" className={inputClasses(errors.email)} />
        </div>
        {errors.email && <p className="text-[11px] font-medium text-red-500 ml-1">{errors.email.message}</p>}
      </div>

      {/* Passwords Grid - Optimization for 2 password fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Password</label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type={isPasswordVisible ? "text" : "password"} 
              {...register("password")} 
              placeholder="••••••••" 
              className={inputClasses(errors.password)} 
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Confirm</label>
          <div className="relative group">
            <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type={isPasswordVisible ? "text" : "password"} 
              {...register("confirmPassword")} 
              placeholder="••••••••" 
              className={inputClasses(errors.confirmPassword)} 
            />
            <button
              type="button"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>
      {(errors.password || errors.confirmPassword) && (
        <p className="text-[11px] font-medium text-red-500 ml-1">
          {errors.password?.message || errors.confirmPassword?.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full py-6 mt-4 text-sm font-bold transition-all active:scale-[0.98] bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 rounded-xl"
      >
        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</> : "Create Account"}
      </Button>
    </form>
  );
}

export default RegisterForm;
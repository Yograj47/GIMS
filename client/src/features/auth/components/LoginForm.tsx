import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react"; 
import axios from "axios";
import { useGlobalStore } from "@/store/globalStore";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { notify } from "@/lib/toast";
import { loginSchema, type LoginFormData } from "@/types/Auth";

function LoginForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { backendUrl } = useGlobalStore();
  const { fetchUser } = useUserStore();
  const navigate = useNavigate();

  const { handleSubmit, register, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${backendUrl}/auths/login`, data);
      if (response.data.status === "success") {
        await fetchUser();
        notify.success("Welcome back!");
        navigate('/dashboard');
      } else {
        notify.error(response?.data?.message);
      }
    } catch (error: any) {
      notify.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
          Email Address
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Mail size={18} />
          </div>
          <input
            id="email"
            type="email"
            {...register("email")}
            placeholder="name@company.com"
            className={`w-full rounded-xl border bg-white/50 pl-11 pr-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10 
            ${errors.email ? 'border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-blue-500 focus:bg-white'}`}
          />
        </div>
        {errors.email && <p className="text-[11px] font-medium text-red-500 ml-1">{errors.email.message}</p>}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between ml-1">
          <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Password
          </label>
          <button type="button" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Forgot password?
          </button>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Lock size={18} />
          </div>
          <input
            id="password"
            type={isPasswordVisible ? "text" : "password"}
            {...register("password")}
            placeholder="••••••••"
            className={`w-full rounded-xl border bg-white/50 pl-11 pr-11 py-2.5 text-sm transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10 
            ${errors.password ? 'border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-blue-500 focus:bg-white'}`}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p className="text-[11px] font-medium text-red-500 ml-1">{errors.password.message}</p>}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full py-6 text-sm font-bold transition-all active:scale-[0.98] bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 rounded-xl mt-2"
      >
        {isLoading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authenticating...</>
        ) : (
          "Sign In to Dashboard"
        )}
      </Button>
    </form>
  );
}

export default LoginForm;
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { registerSchema, type RegisterFormData } from "@/types/Auth";
import { toast } from "react-toastify";
import axios from "axios";
import { useGlobalStore } from "@/store/globalStore";
import { useNavigate } from "react-router-dom";

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
      console.log("Login data:", data);
      const response = await axios.post(`${backendUrl}/auths/`, data)

      if (response?.data?.status === "success") {
        toast.success(response?.data?.message)
        navigate("/verify")
      } else {
        toast.error(response?.data?.message)
      }
    }
    catch (error: any) {
      console.error(error.response?.data?.message);
      toast.error(error.response?.data?.message)
    }
    finally {
      setIsLoading(false);
    }
  };

  // Helper for input styling to keep code clean
  const inputStyles = (error: any) => `
    w-full rounded-xl border bg-white/50 px-4 py-2.5 text-sm transition-all 
    focus:outline-none focus:ring-2 focus:ring-blue-500/20 
    ${error ? 'border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-blue-500'}
  `;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name Field */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-semibold text-slate-700 ml-1">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          placeholder="John Doe"
          className={inputStyles(errors.name)}
        />
        {errors.name && <p className="text-[11px] font-medium text-red-500 ml-1">{errors.name.message}</p>}
      </div>

      {/* Email Field */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-semibold text-slate-700 ml-1">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          placeholder="admin@grocery.local"
          className={inputStyles(errors.email)}
        />
        {errors.email && <p className="text-[11px] font-medium text-red-500 ml-1">{errors.email.message}</p>}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-semibold text-slate-700 ml-1">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={isPasswordVisible ? "text" : "password"}
            {...register("password")}
            placeholder="••••••••"
            className={inputStyles(errors.password)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p className="text-[11px] font-medium text-red-500 ml-1">{errors.password.message}</p>}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700 ml-1">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={isPasswordVisible ? "text" : "password"}
            {...register("confirmPassword")}
            placeholder="••••••••"
            className={inputStyles(errors.confirmPassword)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-[11px] font-medium text-red-500 ml-1">{errors.confirmPassword.message}</p>}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full py-6 mt-2 text-base font-bold transition-all active:scale-[0.98] bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 rounded-xl"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
}

export default RegisterForm;
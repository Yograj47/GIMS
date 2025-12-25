import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

function RegisterForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { handleSubmit, register, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    console.log("Register data:", data);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
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
            type={isConfirmVisible ? "text" : "password"}
            {...register("confirmPassword")}
            placeholder="••••••••"
            className={inputStyles(errors.confirmPassword)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            onClick={() => setIsConfirmVisible(!isConfirmVisible)}
          >
            {isConfirmVisible ? <EyeOff size={18} /> : <Eye size={18} />}
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
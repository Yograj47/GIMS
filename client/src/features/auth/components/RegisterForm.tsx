import { Button } from "@/components/ui/button";
import { useForm, type FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff, Loader2, User, Mail, Lock, Phone, ShieldCheck } from "lucide-react";
import { registerSchema, type RegisterFormData } from "@/types/auth";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

function RegisterForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { register: registerUser, isLoading } = useAuth();

  const { handleSubmit, register, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", claimCode: "", password: "", confirmPassword: "" },
  });

  const navigate = useNavigate();

  const onSubmit = async (
    data: RegisterFormData
  ) => {
    try {
      const success = await registerUser(data);
      if (success) navigate("/shop/verify");
    } catch {
      // The API client displays registration errors.
    }
  };

  const inputClasses = (error: FieldError | undefined) => `
    w-full rounded-xl border pl-11 pr-4 py-2.5 text-sm transition-all outline-none
    focus:ring-4 focus:ring-ring/10
    ${error
      ? 'border-destructive text-foreground placeholder:text-muted-foreground'
      : 'border-input bg-card text-foreground placeholder:text-muted-foreground focus:border-ring'}
  `;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Full Name */}
      <div className="space-y-2">
        <label htmlFor="register-name" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Name</label>
        <div className="relative group">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-link transition-colors" />
          <input id="register-name" autoComplete="name" aria-required="true" aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "register-name-error" : undefined} {...register("name")} placeholder="John Doe" className={inputClasses(errors.name)} />
        </div>
        {errors.name && <p id="register-name-error" role="alert" className="text-[10px] font-bold text-destructive ml-1 uppercase tracking-tight">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="register-email" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Email Address</label>
        <div className="relative group">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-link transition-colors" />
          <input id="register-email" type="email" autoComplete="email" aria-required="true" aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "register-email-error" : undefined} {...register("email")} placeholder="you@example.com" className={inputClasses(errors.email)} />
        </div>
        {errors.email && <p id="register-email-error" role="alert" className="text-[10px] font-bold text-destructive ml-1 uppercase tracking-tight">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="register-mobile" className="text-sm font-medium">Mobile number</label>
        <div className="relative">
          <Phone aria-hidden="true" className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input id="register-mobile" type="tel" autoComplete="tel" aria-required="true" aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "register-mobile-error" : undefined} {...register("phone")} placeholder="9841234567" className={inputClasses(errors.phone)} />
        </div>
        {errors.phone && <p id="register-mobile-error" role="alert" className="text-xs text-destructive">{errors.phone.message}</p>}
      </div>

      <details className="space-y-2 text-sm">
        <summary className="cursor-pointer font-medium text-link">Have a linking code from the store?</summary>
        <label className="grid gap-1">Account linking code
          <input {...register("claimCode")} autoComplete="off" maxLength={22} className="rounded-md border border-input bg-card px-3 py-2" />
        </label>
        {errors.claimCode && <p className="text-xs text-destructive">{errors.claimCode.message}</p>}
      </details>

      {/* Passwords Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="register-password" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Password</label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-link transition-colors" />
            <input
              id="register-password"
              autoComplete="new-password"
              aria-required="true"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "register-password-error" : undefined}
              type={isPasswordVisible ? "text" : "password"}
              {...register("password")}
              placeholder="••••••••"
              className={inputClasses(errors.password)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="register-confirm" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Confirm password</label>
          <div className="relative group">
            <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-link transition-colors" />
            <input
              id="register-confirm"
              autoComplete="new-password"
              aria-required="true"
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? "register-password-error" : undefined}
              type={isPasswordVisible ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="••••••••"
              className={inputClasses(errors.confirmPassword)}
            />
            <button
              type="button"
              aria-label={isPasswordVisible ? "Hide passwords" : "Show passwords"}
              aria-pressed={isPasswordVisible}
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      {(errors.password || errors.confirmPassword) && (
        <p id="register-password-error" role="alert" className="text-[10px] font-bold text-destructive ml-1 uppercase tracking-tight">
          {errors.password?.message || errors.confirmPassword?.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 mt-4 text-sm font-bold transition-all active:scale-[0.98] rounded-xl"
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

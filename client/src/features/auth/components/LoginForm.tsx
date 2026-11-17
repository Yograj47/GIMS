import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/types/auth";
import { useAuth } from "../hooks/useAuth";

export default function LoginForm({ customer = false }: { customer?: boolean }) {
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading } = useAuth();
    const { handleSubmit, register, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data, customer);
        } catch {
            // The API client surfaces the error.
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium">Email address</label>
                <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="you@example.com"
                    className="h-11"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "login-email-error" : undefined}
                    {...register("email")}
                />
                {errors.email && <p id="login-email-error" className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <label htmlFor="password" className="text-sm font-medium">Password</label>
                    <Link to={customer ? "/shop/forget-password" : "/forget-password"} className="text-sm text-link underline-offset-4 hover:underline">
                        Forgot password?
                    </Link>
                </div>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        className="h-11 pr-12"
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby={errors.password ? "login-password-error" : undefined}
                        {...register("password")}
                    />
                    <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                    </button>
                </div>
                {errors.password && <p id="login-password-error" className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={isLoading} className="relative h-11 w-full">
                {isLoading ? "Signing in…" : "Sign in"}
                {isLoading
                    ? <Loader2 className="absolute right-3.5 size-4 animate-spin" aria-hidden="true" />
                    : <ArrowRight className="absolute right-3.5 size-4" aria-hidden="true" />}
            </Button>
        </form>
    );
}

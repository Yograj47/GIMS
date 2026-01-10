import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { loginSchema, type LoginFormData } from "@/types/Auth";
import { useGlobalStore } from "@/store/globalStore";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";

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
            console.log("Login data:", data);
            const response = await axios.post(`${backendUrl}/auths/login`, data)
            console.log(response.data);

            if (response.data.status === "success") {
                await fetchUser()
                navigate('/dashboard');
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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-slate-700 ml-1">
                    Email Address
                </label>
                <input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="admin@grocery.local"
                    className={`w-full rounded-xl border bg-white/50 px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 
            ${errors.email ? 'border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-blue-500'}`}
                />
                {errors.email && <p className="text-[11px] font-medium text-red-500 ml-1">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                    <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                        Password
                    </label>
                    <button type="button" className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                        Forgot password?
                    </button>
                </div>

                <div className="relative group">
                    <input
                        id="password"
                        type={isPasswordVisible ? "text" : "password"}
                        {...register("password")}
                        placeholder="••••••••"
                        className={`w-full rounded-xl border bg-white/50 px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 
              ${errors.password ? 'border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-blue-500'}`}
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
                className="w-full py-6 text-base font-bold transition-all active:scale-[0.98] bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 rounded-xl"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                    </>
                ) : (
                    "Sign In"
                )}
            </Button>
        </form>
    );
}

export default LoginForm;
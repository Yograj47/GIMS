import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPasswordSchema, resetPasswordSchema, type ForgotPasswordFormData, type ResetPasswordFormData } from "@/types/auth";
import { Loader2, Mail, ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { notify } from "@/lib/toast";
import { useAuth } from "../hooks/useAuth";

export default function ForgotPassword() {
    const [step, setStep] = useState<"email" | "otp" | "password">(() => {
        const savedExpiry = localStorage.getItem("otp_expiry");
        if (savedExpiry) {
            const remaining = Math.floor((parseInt(savedExpiry) - Date.now()) / 1000);
            if (remaining > 0) return "otp";
        }
        return "email";
    });

    const [userEmail, setUserEmail] = useState(() => {
        const savedExpiry = localStorage.getItem("otp_expiry");
        if (savedExpiry) {
            const remaining = Math.floor((parseInt(savedExpiry) - Date.now()) / 1000);
            if (remaining > 0) return localStorage.getItem("reset_email") || "";
        }
        return "";
    });

    const [timer, setTimer] = useState(() => {
        const savedExpiry = localStorage.getItem("otp_expiry");
        if (savedExpiry) {
            const remaining = Math.floor((parseInt(savedExpiry) - Date.now()) / 1000);
            if (remaining > 0) return remaining;
        }
        return 0;
    });

    const navigate = useNavigate();
    const {
        forgotPassword,
        resetPassword,
        isLoading,
    } = useAuth();

    const requestForm = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const resetForm = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { otp: "", password: "", confirmPassword: "" }
    });

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // --- Step 1: Request OTP ---
    const handleSendOtp = async (data: ForgotPasswordFormData) => {
        const success = await forgotPassword(data);
        if (!success) return;

        setUserEmail(data.email);
        setStep("otp");

        // eslint-disable-next-line react-hooks/purity
        const expiry = Date.now() + 600000;
        localStorage.setItem("otp_expiry", expiry.toString());
        localStorage.setItem("reset_email", data.email);
        setTimer(600);
    };

    // --- Step 2: Validate OTP format locally & move to password ---
    const goToPasswordStep = async () => {
        const currentOtp = resetForm.getValues("otp");
        if (currentOtp?.length === 6) {
            setStep("password");
        } else {
            notify.error("Please enter the 6-digit code first");
        }
    };

    // --- Step 3: Final API Call ---
    const onFinalSubmit = async (data: ResetPasswordFormData) => {
        const success = await resetPassword({
            email: userEmail,
            otp: data.otp,
            newPassword: data.password,
        });

        if (!success) return;

        localStorage.removeItem("otp_expiry");
        localStorage.removeItem("reset_email");
        navigate("/login");
    };

    const handleResend = async () => {
        if (timer > 0 || !userEmail) return;
        try {
            await forgotPassword({ email: userEmail });
            setTimer(600);
            notify.success("New code sent!");
        } catch {
            // Error handled via service or ignored safely
        }
    };

    const midnightInput = "bg-slate-950/40 border-white/5 text-slate-200 placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-slate-950/60 transition-all rounded-2xl py-7 pl-6 shadow-inner";

    return (
        <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl animate-in fade-in zoom-in duration-500">
            <div className="mb-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 mb-6 shadow-[0_0_20px_rgba(37,99,235,0.1)]">
                    {step === "email" && <Mail size={32} />}
                    {step === "otp" && <KeyRound size={32} />}
                    {step === "password" && <ShieldCheck size={32} />}
                </div>

                <h2 className="text-3xl font-black text-white tracking-tight text-center">
                    {step === "email" && "Reset Access"}
                    {step === "otp" && "Check Email"}
                    {step === "password" && "New Credentials"}
                </h2>

                <p className="text-slate-400 text-sm text-center mt-3 font-medium leading-relaxed">
                    {step === "email" && "Enter your email to receive a secure recovery code."}
                    {step === "otp" && (
                        <span>Sent to <span className="text-blue-400 font-bold">{userEmail}</span></span>
                    )}
                    {step === "password" && "Choose a strong password for your GIMS account."}
                </p>
            </div>

            {step === "email" && (
                <form onSubmit={requestForm.handleSubmit(handleSendOtp)} className="space-y-5">
                    <Input
                        {...requestForm.register("email")}
                        placeholder="admin@grocery.local"
                        className={midnightInput}
                    />
                    <Button className="w-full py-7 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-white shadow-lg shadow-blue-900/20" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : "Request Security Code"}
                    </Button>
                </form>
            )}

            {step === "otp" && (
                <div className="space-y-6">
                    <Input
                        {...resetForm.register("otp")}
                        placeholder="000000"
                        className="py-10 rounded-2xl bg-slate-950/60 border-white/10 text-center text-3xl font-black tracking-[0.6em] text-blue-400 focus:border-blue-500"
                        maxLength={6}
                    />
                    <Button onClick={goToPasswordStep} className="w-full py-7 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-white shadow-lg shadow-blue-900/20">
                        Verify Identity
                    </Button>
                    <button
                        onClick={handleResend}
                        disabled={timer > 0}
                        className="w-full text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] disabled:opacity-30 transition-opacity"
                    >
                        {timer > 0 ? `Resend available in ${formatTime(timer)}` : "Request New Code"}
                    </button>
                </div>
            )}

            {step === "password" && (
                <form onSubmit={resetForm.handleSubmit(onFinalSubmit)} className="space-y-4">
                    <Input
                        type="password"
                        {...resetForm.register("password")}
                        placeholder="Strong New Password"
                        className={midnightInput}
                    />
                    <Input
                        type="password"
                        {...resetForm.register("confirmPassword")}
                        placeholder="Repeat New Password"
                        className={midnightInput}
                    />
                    <Button className="w-full py-7 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-white shadow-xl shadow-blue-900/20" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : "Update Credentials"}
                    </Button>
                    <button
                        type="button"
                        onClick={() => setStep("otp")}
                        className="w-full text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-300"
                    >
                        Back to Code Entry
                    </button>
                </form>
            )}

            <div className="mt-10 pt-6 border-t border-white/5 text-center">
                <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Return to Login
                </Link>
            </div>
        </div>
    );
}
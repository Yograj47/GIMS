import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPasswordSchema, resetPasswordSchema, type ForgotPasswordFormData, type ResetPasswordFormData, type ResetPasswordPayload } from "@/types/Auth";
import { authService } from "@/features/auth/api/AuthService";
import { Loader2, Mail, ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { notify } from "@/lib/toast";

export default function ForgotPassword() {
    const [step, setStep] = useState<"email" | "otp" | "password">("email");
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [timer, setTimer] = useState(0);
    const navigate = useNavigate();

    const requestForm = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const resetForm = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { otp: "", password: "", confirmPassword: "" }
    });

    // --- Timer Persistence ---
    useEffect(() => {
        const savedExpiry = localStorage.getItem("otp_expiry");
        if (savedExpiry) {
            const remaining = Math.floor((parseInt(savedExpiry) - Date.now()) / 1000);
            if (remaining > 0) {
                setTimer(remaining);
                setStep("otp");
                setUserEmail(localStorage.getItem("reset_email") || "");
            }
        }
    }, []);

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
        setLoading(true);
        try {
            await authService.forgotPassword(data);
            setUserEmail(data.email);
            setStep("otp");
            const expiry = Date.now() + 600000; // 10 mins
            localStorage.setItem("otp_expiry", expiry.toString());
            localStorage.setItem("reset_email", data.email);
            setTimer(600);
            notify.success("OTP sent to your email");
        } finally {
            setLoading(false);
        }
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
        setLoading(true);
        try {
            const payLoad: ResetPasswordPayload = {
                email: userEmail,
                otp: data.otp,
                newPassword: data.confirmPassword
            }
            await authService.resetPassword(payLoad);
            notify.success("Password updated successfully!");
            localStorage.removeItem("otp_expiry");
            localStorage.removeItem("reset_email");
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0 || !userEmail) return;
        setLoading(true);
        try {
            await authService.forgotPassword({ email: userEmail });
            setTimer(600);
            notify.success("New code sent!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in fade-in duration-500">

            {/* Header UI */}
            <div className="mb-8 flex flex-col items-center">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                    {step === "email" && <Mail size={28} />}
                    {step === "otp" && <KeyRound size={28} />}
                    {step === "password" && <ShieldCheck size={28} />}
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                    {step === "email" && "Forgot Password"}
                    {step === "otp" && "Check your Email"}
                    {step === "password" && "New Password"}
                </h2>
                <p className="text-slate-500 text-sm text-center mt-2">
                    {step === "email" && "Enter your email address to receive a 6-digit reset code."}
                    {step === "otp" && `We've sent a code to ${userEmail}`}
                    {step === "password" && "Choose a strong password you haven't used before."}
                </p>
            </div>

            {/* STEP 1: EMAIL */}
            {step === "email" && (
                <form onSubmit={requestForm.handleSubmit(handleSendOtp)} className="space-y-4">
                    <Input
                        {...requestForm.register("email")}
                        placeholder="Email address"
                        className="py-7 rounded-2xl pl-6"
                    />
                    <Button className="w-full py-7 rounded-2xl bg-blue-600 font-bold hover:bg-blue-700" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : "Send Code"}
                    </Button>
                </form>
            )}

            {/* STEP 2: OTP */}
            {step === "otp" && (
                <div className="space-y-4">
                    <Input
                        {...resetForm.register("otp")}
                        placeholder="000000"
                        className="py-8 rounded-2xl text-center text-2xl font-bold tracking-[0.5em]"
                        maxLength={6}
                    />
                    <Button onClick={goToPasswordStep} className="w-full py-7 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold">
                        Next
                    </Button>
                    <button
                        onClick={handleResend}
                        disabled={timer > 0}
                        className="w-full text-xs font-bold text-blue-600 uppercase tracking-widest disabled:opacity-50"
                    >
                        {timer > 0 ? `Resend in ${formatTime(timer)}` : "Resend Code"}
                    </button>
                </div>
            )}

            {/* STEP 3: PASSWORD (The Final Action) */}
            {step === "password" && (
                <form onSubmit={resetForm.handleSubmit(onFinalSubmit)} className="space-y-4">
                    <Input
                        type="password"
                        {...resetForm.register("password")}
                        placeholder="New Password"
                        className="py-7 rounded-2xl pl-6"
                    />
                    <Input
                        type="password"
                        {...resetForm.register("confirmPassword")}
                        placeholder="Confirm Password"
                        className="py-7 rounded-2xl pl-6"
                    />
                    <Button className="w-full py-7 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-xl" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : "Reset Password"}
                    </Button>
                    <button
                        type="button"
                        onClick={() => setStep("otp")}
                        className="w-full text-xs font-bold text-slate-400 uppercase"
                    >
                        Edit Code
                    </button>
                </form>
            )}

            <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-2">
                    <ArrowLeft size={16} /> Back to login
                </Link>
            </div>
        </div>
    );
}
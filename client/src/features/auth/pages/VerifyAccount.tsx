import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp"; // Shadcn component
import { ShieldCheck, MailWarning, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/store/useAuth";

export default function VerifyAccount() {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState<string>("");
  const { isLoading, sendVerifyOtp, verifyEmail } = useAuthStore();


  const handleSendOtp = async () => {
    await sendVerifyOtp();
    setOtpSent(true);
  };

  const handleVerifyOtp = async () => {
    if (otp.length === 6) {
      await verifyEmail({ otp });
    }
  };

  return (
    <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 md:p-10 animate-in fade-in zoom-in duration-500">

      {/* Visual Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className={`p-4 rounded-full mb-4 transition-colors duration-500 ${otpSent ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
          {otpSent ? <ShieldCheck size={32} /> : <MailWarning size={32} />}
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {otpSent ? "Verify Identity" : "Check Security"}
        </h2>
        <p className="text-sm text-slate-500 mt-2 font-medium max-w-60">
          {otpSent
            ? "We've sent a 6-digit code to your registered email address."
            : "To protect your inventory data, please verify your account identity."}
        </p>
      </div>

      {!otpSent ? (
        <Button
          className="w-full py-7 text-base font-bold transition-all active:scale-[0.98] bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 rounded-2xl"
          onClick={handleSendOtp}
          disabled={isLoading}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...</>
          ) : (
            <>Send Verification Code <ArrowRight className="ml-2 h-5 w-5" /></>
          )}
        </Button>
      ) : (
        <div className="space-y-8 flex flex-col items-center">
          {/* Shadcn OTP Input */}
          <div className="space-y-2 flex flex-col items-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
              containerClassName="group flex items-center has-[:disabled]:opacity-50"
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot index={0} className="w-12 h-14 text-lg font-bold border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10" />
                <InputOTPSlot index={1} className="w-12 h-14 text-lg font-bold border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10" />
                <InputOTPSlot index={2} className="w-12 h-14 text-lg font-bold border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10" />
                <InputOTPSlot index={3} className="w-12 h-14 text-lg font-bold border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10" />
                <InputOTPSlot index={4} className="w-12 h-14 text-lg font-bold border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10" />
                <InputOTPSlot index={5} className="w-12 h-14 text-lg font-bold border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10" />
              </InputOTPGroup>
            </InputOTP>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">
              Enter 6-digit code
            </label>
          </div>

          <div className="w-full space-y-3">
            <Button
              className="w-full py-6 text-sm font-bold transition-all active:scale-[0.98] bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-100 rounded-xl"
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || isLoading}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Continue"}
            </Button>

            <button
              type="button"
              onClick={handleSendOtp}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors py-2"
              disabled={isLoading}
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              Resend Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp"; 
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
    <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-2xl p-8 md:p-10 animate-in fade-in zoom-in duration-500">

      {/* Visual Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className={`p-5 rounded-2xl mb-6 transition-all duration-700 shadow-lg ${
          otpSent 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-emerald-500/5' 
            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-blue-500/5'
        }`}>
          {otpSent ? <ShieldCheck size={36} /> : <MailWarning size={36} />}
        </div>
        
        <h2 className="text-3xl font-black text-white tracking-tight">
          {otpSent ? "Verify Identity" : "Security Check"}
        </h2>
        
        <p className="text-sm text-slate-400 mt-3 font-medium max-w-65 leading-relaxed">
          {otpSent
            ? "We've sent a 6-digit code to your registered email address."
            : "To protect your inventory data, please verify your account identity."}
        </p>
      </div>

      {!otpSent ? (
        <Button
          className="w-full h-14 text-base font-bold transition-all active:scale-[0.98] bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 rounded-xl group"
          onClick={handleSendOtp}
          disabled={isLoading}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Preparing...</>
          ) : (
            <>
              Send Verification Code 
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-10 flex flex-col items-center">
          {/* Shadcn OTP Input - Dark Themed */}
          <div className="space-y-4 flex flex-col items-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
              containerClassName="group flex items-center has-[:disabled]:opacity-50"
            >
              <InputOTPGroup className="gap-2 md:gap-3">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot 
                    key={index}
                    index={index} 
                    className="w-12 h-14 md:w-14 md:h-16 text-xl font-black border-white/5 bg-slate-950/40 text-blue-400 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all" 
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
              Input Security Token
            </label>
          </div>

          <div className="w-full space-y-4">
            <Button
              className="w-full h-14 text-sm font-bold transition-all active:scale-[0.98] bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 rounded-xl"
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || isLoading}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authenticate & Access"}
            </Button>

            <button
              type="button"
              onClick={handleSendOtp}
              className="w-full flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors py-2"
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
import { workspaceHome } from "@/shared/constants/roles";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp";
import { ShieldCheck, MailWarning, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function VerifyAccount() {
  const customer = useAuthStore((state) => state.user?.role === "customer");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState<string>("");
  const { isLoading, sendVerifyOtp, verifyEmail } = useAuth();
  const navigate = useNavigate();
  
  const handleSendOtp = async () => {
    try {
      await sendVerifyOtp();
    } finally {
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;

    const success =
      await verifyEmail({ otp });

    if (success) {
      navigate(workspaceHome(useAuthStore.getState().user?.role), { replace: true });
    }
  };

  return (
    <div className="w-full max-w-md bg-card rounded-[2.5rem] border border-border shadow-2xl p-8 md:p-10 animate-in fade-in zoom-in duration-500">

      {/* Visual Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className={`p-5 rounded-2xl mb-6 transition-all duration-700 shadow-lg ${otpSent
          ? 'bg-accent text-accent-foreground border border-border'
          : 'bg-muted text-link border border-border'
          }`}>
          {otpSent ? <ShieldCheck size={36} /> : <MailWarning size={36} />}
        </div>

        <h2 className="text-3xl font-black text-foreground tracking-tight">
          {otpSent ? "Verify Identity" : "Security Check"}
        </h2>

        <p className="text-sm text-muted-foreground mt-3 font-medium max-w-65 leading-relaxed">
          {otpSent
            ? "We've sent a 6-digit code to your registered email address."
            : customer ? "Verify your email to finish creating your shopping account." : "Verify your email to access your workspace."}
        </p>
      </div>

      {!otpSent ? (
        <Button
          className="w-full h-14 text-base font-bold transition-all active:scale-[0.98] rounded-xl group"
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
                    className="w-12 h-14 md:w-14 md:h-16 text-xl font-black border-input bg-card text-link rounded-xl focus:ring-4 focus:ring-ring/20 focus:border-ring transition-all"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
              Input Security Token
            </label>
          </div>

          <div className="w-full space-y-4">
            <Button
              className="w-full h-14 text-sm font-bold transition-all active:scale-[0.98] rounded-xl"
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || isLoading}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authenticate & Access"}
            </Button>

            <button
              type="button"
              onClick={handleSendOtp}
              className="w-full flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-link transition-colors py-2"
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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from "@/components/ui/input-otp"; // Shadcn component
import { ShieldCheck, MailWarning, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import axios from "axios";
import { useGlobalStore } from "@/store/globalStore";
import { useUserStore } from "@/store/userStore";
import { notify } from "@/lib/toast"; 
import { useNavigate } from "react-router-dom";

export default function VerifyAccount() {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const { backendUrl } = useGlobalStore();
  const { fetchUser } = useUserStore();
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${backendUrl}/auths/send-verify-otp`,
        {},
        { withCredentials: true }
      );

      if (response?.data?.status === "success") {
        setOtpSent(true);
        notify.success("Code Sent!", "Check your email for the verification code.");
      }
    } catch (error: any) {
      notify.error(error?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${backendUrl}/auths/verify-account`,
        { otp },
        { withCredentials: true }
      );

      if (response?.data?.status === "success") {
        notify.success("Verified!", "Your account is now ready to use.");
        await fetchUser();
        navigate("/dashboard");
      }
    } catch (error: any) {
      notify.error(error?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
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
          disabled={loading}
        >
          {loading ? (
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
              render={({ slots }) => (
                <InputOTPGroup className="gap-2">
                  {slots.map((slot, index) => (
                    <InputOTPSlot 
                      index={index} 
                      {...slot} 
                      className="w-12 h-14 text-lg font-bold border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10"
                    />
                  ))}
                </InputOTPGroup>
              )}
            />
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">
              Enter 6-digit code
            </label>
          </div>

          <div className="w-full space-y-3">
            <Button
              className="w-full py-6 text-sm font-bold transition-all active:scale-[0.98] bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-100 rounded-xl"
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Continue"}
            </Button>

            <button
              type="button"
              onClick={handleSendOtp}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors py-2"
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Resend Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
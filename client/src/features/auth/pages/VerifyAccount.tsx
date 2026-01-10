import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useGlobalStore } from "@/store/globalStore";
import { useUserStore } from "@/store/userStore"; // Import your user store
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function VerifyAccount() {
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const { backendUrl } = useGlobalStore();
    const { fetchUser} = useUserStore();
    const navigate = useNavigate();

    const handleSendOtp = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${backendUrl}/auths/send-verify-otp`,
                {}, // Empty body for POST
                { withCredentials: true }
            );

            if (response?.data?.status === "success") {
                setOtpSent(true);
                toast.success(response?.data?.message);
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to send OTP");
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
                toast.success("Account verified successfully!");
                await fetchUser();
                navigate("/dashboard");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    // The return must be inside the component function
    return (
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border p-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-slate-900">
                    Verify your account
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    We’ll send a one-time password to verify your account
                </p>
            </div>

            {!otpSent ? (
                <Button
                    className="w-full"
                    onClick={handleSendOtp}
                    disabled={loading}
                >
                    {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Enter OTP
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            placeholder="6-digit code"
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleVerifyOtp}
                        disabled={otp.length !== 6 || loading}
                    >
                        {loading ? "Verifying..." : "Verify Account"}
                    </Button>

                    <button
                        type="button"
                        onClick={handleSendOtp}
                        className="w-full text-xs text-slate-500 hover:text-blue-600 transition"
                        disabled={loading}
                    >
                        Resend OTP
                    </button>
                </div>
            )}
        </div>
    );
}
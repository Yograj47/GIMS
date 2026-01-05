import { useState } from "react";
import { Button } from "@/components/ui/button";

const VerifyAccount = () => {
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");

    const handleSendOtp = () => {
        // call API: send OTP
        setOtpSent(true);
    };

    const handleVerifyOtp = () => {
        // call API: verify OTP
        console.log("OTP entered:", otp);
    };

    return (
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
                Verify Your Account
            </h2>

            <p className="text-sm text-gray-500 text-center mb-6">
                Verify your account using the OTP sent to your registered email or phone.
            </p>

            {!otpSent ? (
                <Button
                    className="w-full"
                    onClick={handleSendOtp}
                >
                    Send OTP
                </Button>
            ) : (
                <>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Enter OTP
                        </label>
                        <input
                            type="text"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="6-digit OTP"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleVerifyOtp}
                        disabled={otp.length !== 6}
                    >
                        Verify Account
                    </Button>
                </>
            )}
        </div>
    );
};

export default VerifyAccount;

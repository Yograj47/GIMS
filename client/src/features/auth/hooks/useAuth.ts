import { useAuthStore } from "@/store/authStore";

import { authService } from "../api/auth.service";

import { notify } from "@/lib/toast";

import type {
    LoginFormData,
    RegisterFormData,
    VerifyEmailFormData,
    ResetPasswordPayload,
    ForgotPasswordFormData,
} from "@/types/auth";

export const useAuth = () => {
    const {
        user,
        isAuthenticated,
        isLoading,

        setLoading,
        fetchUser,
        reset,
    } = useAuthStore();

    const login = async (
        payload: LoginFormData
    ) => {
        try {
            setLoading(true);

            await authService.login(
                payload
            );

            await fetchUser();

            notify.success(
                "Welcome back!"
            );

            return true;
        } finally {
            setLoading(false);
        }
    };

    const register = async (
        payload: RegisterFormData
    ) => {
        try {
            setLoading(true);

            await authService.register(
                payload
            );

            notify.success(
                "Account created successfully"
            );

            return true;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);

            await authService.logout();

            reset();

            return true;
        } finally {
            setLoading(false);
        }
    };

    const sendVerifyOtp =
        async () => {
            try {
                setLoading(true);

                await authService.sendVerifyOtp();

                notify.success(
                    "OTP sent successfully"
                );

                return true;
            } finally {
                setLoading(false);
            }
        };

    const verifyEmail =
        async (
            payload: VerifyEmailFormData
        ) => {
            try {
                setLoading(true);

                await authService.verifyEmail(
                    payload
                );

                await fetchUser();

                notify.success(
                    "Email verified"
                );

                return true;
            } finally {
                setLoading(false);
            }
        };

    const forgotPassword =
        async (
            payload: ForgotPasswordFormData
        ) => {
            try {
                setLoading(true);

                const response =
                    await authService.forgotPassword(
                        payload
                    );

                notify.success(
                    response.message ||
                    "OTP sent successfully"
                );

                return true;
            } finally {
                setLoading(false);
            }
        };

    const resetPassword =
        async (
            payload: ResetPasswordPayload
        ) => {
            try {
                setLoading(true);

                await authService.resetPassword(
                    payload
                );

                notify.success(
                    "Password updated"
                );

                return true;
            } finally {
                setLoading(false);
            }
        };

    return {
        user,
        isAuthenticated,
        isLoading,

        login,
        register,
        logout,
        sendVerifyOtp,
        verifyEmail,
        forgotPassword,
        resetPassword,
    };
};
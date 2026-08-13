import api from "@/lib/api";
import type { ApiResponse } from "@/types/api";

import type {
    ForgotPasswordFormData,
    LoginFormData,
    RegisterFormData,
    ResetPasswordPayload,
    VerifyEmailFormData,

} from "@/types/auth";
import type { UserData } from "@/types/user";

const BASE_URL = "/auth";

export const authService = {
    register: async (
        payload: RegisterFormData
    ) => {
        const { data } =
            await api.post<
                ApiResponse<UserData>
            >(
                `${BASE_URL}/register`,
                payload
            );

        return data;
    },

    login: async (
        payload: LoginFormData
    ) => {
        const { data } =
            await api.post<
                ApiResponse
            >(
                `${BASE_URL}/login`,
                payload
            );

        return data;
    },

    logout: async () => {
        const { data } =
            await api.post<
                ApiResponse
            >(
                `${BASE_URL}/logout`
            );

        return data;
    },

    sendVerifyOtp: async () => {
        const { data } =
            await api.post<
                ApiResponse
            >(
                `${BASE_URL}/verify-otp`
            );

        return data;
    },

    verifyEmail: async (
        payload: VerifyEmailFormData
    ) => {
        const { data } =
            await api.post<
                ApiResponse
            >(
                `${BASE_URL}/verify-email`,
                payload
            );

        return data;
    },

    forgotPassword: async (
        payload: ForgotPasswordFormData
    ) => {
        const { data } =
            await api.post<
                ApiResponse
            >(
                `${BASE_URL}/forgot-password`,
                payload
            );

        return data;
    },

    resetPassword: async (
        payload: ResetPasswordPayload
    ) => {
        const { data } =
            await api.post<
                ApiResponse
            >(
                `${BASE_URL}/reset-password`,
                payload
            );

        return data;
    },
};
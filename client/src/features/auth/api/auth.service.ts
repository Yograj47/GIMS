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
                `${BASE_URL}/customer/register`,
                { ...payload, claimCode: payload.claimCode || undefined }
            );

        return data;
    },

    login: async (
        payload: LoginFormData,
        customer = false,
    ) => {
        const { data } =
            await api.post<
                ApiResponse
            >(
                `${BASE_URL}/${customer ? "customer/login" : "login"}`,
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
        payload: ForgotPasswordFormData,
        customer = false,
    ) => {
        const { data } =
            await api.post<
                ApiResponse
            >(
                `${BASE_URL}/${customer ? "customer/" : ""}forgot-password`,
                payload
            );

        return data;
    },

    resetPassword: async (
        payload: ResetPasswordPayload,
        customer = false,
    ) => {
        const { data } =
            await api.post<
                ApiResponse
            >(
                `${BASE_URL}/${customer ? "customer/" : ""}reset-password`,
                payload
            );

        return data;
    },
};

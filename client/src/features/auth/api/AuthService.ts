import api from "@/lib/api";
import type { 
  AuthResponse, 
  ForgotPasswordFormData, 
  LoginFormData, 
  RegisterFormData, 
  ResetPasswordPayload, 
  VerifyEmailFormData
} from "@/types/Auth";

const BASE_URL = "/auths";

export const authService = {
    register: async (payload: RegisterFormData) => {
        const { data } = await api.post<AuthResponse>(`${BASE_URL}/`, payload);
        return data;
    },

    login: async (payload: LoginFormData) => {
        const { data } = await api.post<AuthResponse>(`${BASE_URL}/login`, payload);
        return data;
    },

    getProfile: async () => {
        const { data } = await api.get<AuthResponse>("/users/profile");
        return data;
    },

    logout: async () => {
        const { data } = await api.post<AuthResponse>(`${BASE_URL}/logout`);
        return data;
    },

    sendOTP: async () => {
        const { data } = await api.post<AuthResponse>(`${BASE_URL}/send-verify-otp`);
        return data;
    },

    verifyEmail: async (payload: VerifyEmailFormData) => {
        const { data } = await api.post<AuthResponse>(`${BASE_URL}/verify-account`, payload);
        return data;
    },

    forgotPassword: async (email: ForgotPasswordFormData) => {
        const { data } = await api.post<AuthResponse>(`${BASE_URL}/reset-password-otp`, email);
        return data;
    },

    resetPassword: async (payload: ResetPasswordPayload) => {
        const { data } = await api.post<AuthResponse>(`${BASE_URL}/reset-password`, payload);
        return data;
    }
};
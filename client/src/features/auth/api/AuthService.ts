import api from "@/lib/api";
import type {
    AuthResponse,
    ForgotPasswordFormData,
    LoginFormData,
    RegisterFormData,
    ResetPasswordPayload,
    VerifyEmailFormData,
    UserData // Import UserData for the generics
} from "@/types/Auth";

const BASE_URL = "/auths";

export const authService = {
    register: async (payload: RegisterFormData) => {
        const { data } = await api.post<AuthResponse<UserData>>(`${BASE_URL}/`, payload);
        return data;
    },

    login: async (payload: LoginFormData) => {
        const { data } = await api.post<AuthResponse>(`${BASE_URL}/login`, payload);
        return data;
    },

    getProfile: async () => {
        const { data } = await api.get<AuthResponse<UserData>>("/users/profile");
        return data;
    },

    getUsers: async () => {
        const { data } = await api.get<AuthResponse<UserData[]>>("/users/all");
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
    },

    updateRole: async (userId: string, newRole: string) => {
        const { data } = await api.put<AuthResponse<UserData>>(`${BASE_URL}/role/${userId}`, { role: newRole });
        return data;
    },

    updateProfile: async (userId: string, name: string, email: string) => {
        const { data } = await api.patch<AuthResponse<UserData>>(`users/update-details/${userId}`, { name, email });
        return data;
    },

    updatePassword: async (userId: string, currentPassword: string, newPassword: string) => {
        const { data } = await api.patch<AuthResponse>(`users/update-password/${userId}`, { currentPassword, newPassword });
        return data;
    }
};

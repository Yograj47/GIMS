import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware"
import { authService } from "@/features/auth/api/AuthService";
import type { LoginFormData, RegisterFormData, UserData, VerifyEmailFormData } from "@/types/Auth";


type AuthState = {
    user: UserData | null;
    isAuthenticated: boolean;
    isInitialLoading: boolean;
    isLoading: boolean;
    setUser: (user: UserData | null) => void;
    fetchUser: () => Promise<void>;
    loginUser: (credentials: LoginFormData) => Promise<void>;
    registerUser: (data: RegisterFormData) => Promise<void>;
    logout: () => Promise<void>;
    sendVerifyOtp: () => Promise<void>;
    verifyEmail: (data: VerifyEmailFormData) => Promise<void>
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isInitialLoading: true,
            isLoading: false,
            setUser: (user) => set({ user }),

            fetchUser: async () => {
                try {
                    const response = await authService.getProfile();
                    if (response.status === "Success" && response.data) {
                        set({ user: response.data, isAuthenticated: true });
                    }
                } catch (error) {
                    // SILENT FAIL: If the user isn't logged in (401), 
                    // we just ensure the state reflects that.
                    set({ user: null, isAuthenticated: false });
                } finally {
                    // This is crucial: it hides the Loading component 
                    // regardless of whether the user is logged in or not.
                    set({ isInitialLoading: false });
                }
            },

            loginUser: async (credentials) => {
                set({ isLoading: true });
                try {
                    const response = await authService.login(credentials);
                    if (response.status === "Success") {
                        const profile = await authService.getProfile();
                        set({ user: profile.data || null, isAuthenticated: true });
                        window.location.href = "/dashboard";
                    }
                } finally {
                    set({ isLoading: false });
                }
            },

            registerUser: async (data) => {
                set({ isLoading: true });
                try {
                    const response = await authService.register(data);
                    if (response.status === "Success") {
                        window.location.href = "/verify";
                    }
                } catch (error) {
                    // Error handled by interceptor
                } finally {
                    set({ isLoading: false });
                }
            },

            logout: async () => {
                set({ isLoading: true });
                try {
                    await authService.logout();
                } catch (error) {
                    // Fail silently for logout
                } finally {
                    // Clear everything
                    set({ user: null, isAuthenticated: false, isLoading: false });
                    localStorage.removeItem("user-storage");
                    window.location.href = "/login";
                }
            },

            sendVerifyOtp: async () => {
                set({ isLoading: true });
                try {
                    await authService.sendOTP();
                } finally {
                    set({ isLoading: false });
                }
            },

            verifyEmail: async (data) => {
                set({ isLoading: true });
                try {
                    const response = await authService.verifyEmail(data);
                    if (response.status === "Success") {
                        const profile = await authService.getProfile();
                        set({ user: profile.data || null, isAuthenticated: true });
                        window.location.href = "/dashboard";
                    }
                } finally {
                    set({ isLoading: false });
                }
            }
        }),
        {
            name: "user-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
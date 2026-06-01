import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authService } from "@/features/auth/api/AuthService";
import type {
    LoginFormData,
    RegisterFormData,
    UserData,
    VerifyEmailFormData,
} from "@/types/Auth";
import { notify } from "@/lib/toast";

type AuthState = {
    user: UserData | null;
    users: UserData[] | null;
    isAuthenticated: boolean;
    isInitialLoading: boolean;
    isLoading: boolean;
    setUser: (user: UserData | null) => void;
    setUsers: (users: UserData[] | null) => void;
    fetchUser: () => Promise<void>;
    fetchUsers: () => Promise<void>;
    loginUser: (credentials: LoginFormData) => Promise<void>;
    registerUser: (data: RegisterFormData) => Promise<void>;
    logout: () => Promise<void>;
    sendVerifyOtp: () => Promise<void>;
    verifyEmail: (data: VerifyEmailFormData) => Promise<void>;
    updateRole: (userId: string, newRole: string) => Promise<void>;
    updateProfile: (name: string, email: string) => Promise<void>;
    updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    removeUser: (userId: string) => Promise<void>;
};


export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            users: null,
            isAuthenticated: false,
            isInitialLoading: true,
            isLoading: false,

            setUser: (user) => set({ user, isAuthenticated: !!user }),
            setUsers: (users) => set({ users }),

            fetchUser: async () => {
                try {
                    const response = await authService.getProfile();
                    if (response.status === "Success" && response.data) {
                        set({ user: response.data, isAuthenticated: true });
                    }
                } catch (error) {
                    set({ user: null, isAuthenticated: false });
                } finally {
                    set({ isInitialLoading: false });
                }
            },

            fetchUsers: async () => {
                set({ isLoading: true });
                try {
                    const response = await authService.getUsers();
                    if (response.status === "Success" && Array.isArray(response.data)) {
                        set({ users: response.data });
                    }
                } catch (error) {
                    console.error("Error fetching users:", error);
                    set({ users: [] });
                } finally {
                    set({ isLoading: false });
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
                        notify.success("Welcome back!", "You have successfully logged in.");
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
                        notify.success("Account created!", "Please verify your email to continue.");
                    }
                } finally {
                    set({ isLoading: false });
                }
            },

            logout: async () => {
                set({ isLoading: true });
                try {
                    await authService.logout();
                } finally {
                    set({ user: null, users: null, isAuthenticated: false, isLoading: false });
                    useAuthStore.persist.clearStorage();

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
            },

            updateRole: async (userId: string, newRole: string) => {
                set({ isLoading: true });
                try {
                    const response = await authService.updateRole(userId, newRole);
                    const updatedUser = response.data as UserData;

                    const currentUser = get().user;
                    if (currentUser && currentUser._id === userId) {
                        set({ user: updatedUser });
                    }

                    const currentUsersList = get().users;
                    if (currentUsersList) {
                        set({
                            users: currentUsersList.map((u) =>
                                u._id === userId ? updatedUser : u
                            ),
                        });
                    }
                    notify.success(response.message || "User role updated successfully");
                } finally {
                    set({ isLoading: false });
                    window.location.href = "/dashboard";
                }
            },

            updateProfile: async (name: string, email: string) => {
                set({ isLoading: true });
                try {
                    const response = await authService.updateProfile(name, email);
                    const updatedUser = response.data as UserData;
                    set({ user: updatedUser });
                    notify.success(response.message || "Profile updated successfully");
                } finally {
                    set({ isLoading: false });

                }
            },

            updatePassword: async (currentPassword: string, newPassword: string) => {
                set({ isLoading: true });
                try {
                    const response = await authService.updatePassword(currentPassword, newPassword);
                    notify.success(response.message || "Password updated successfully");
                } finally {
                    set({ isLoading: false });
                }
            },

            removeUser: async (userId: string) => {
                set({ isLoading: true });
                try {
                    await authService.removeUser(userId);
                    const currentUsersList = get().users;
                    if (currentUsersList) {
                        set({
                            users: currentUsersList.filter((u) => u._id !== userId),
                        });
                    }
                } finally {
                    set({ isLoading: false });
                }
            },
        }),
        {
            name: "user-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
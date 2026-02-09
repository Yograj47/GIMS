import axios from "axios";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware"
import { useGlobalStore } from "./globalStore";

type User = {
    name: string;
    role: "owner" | "staff" | "admin";
    password: string;
    email: string;
    isVerified: boolean;
};

type AuthState = {
    user: User | null;
    isAuth: boolean;
    setAuth: (bool: boolean) => void;
    setUser: (user: User | null) => void;
    fetchUser: () => Promise<void>;
};

const backendUrl = useGlobalStore.getState().backendUrl;

export const useUserStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuth: false,
            setAuth: (bool) => set({ isAuth: bool }),
            setUser: (user) => set({ user }),
            fetchUser: async () => {
                try {
                    const response = await axios.get<User>(`${backendUrl}/users/profile`, { withCredentials: true });
                    set({ user: response.data, isAuth: true });
                } catch (error: any) {
                    console.error("Failed to fetch user", error?.response?.data?.message);
                    set({ user: null, isAuth: false });
                }
            }
        }),
        {
            name: "user-storage", 
            storage: createJSONStorage(() => localStorage), 
        }
    )
);
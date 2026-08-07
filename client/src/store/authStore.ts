import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { UserData } from "@/types/user";
import { userService } from "@/features/auth/api/user.service";
import { socket } from "@/socket/socket";

interface AuthState {
    user: UserData | null;
    users: UserData[];

    isAuthenticated: boolean;
    isInitialLoading: boolean;
    isLoading: boolean;

    fetchUser: () => Promise<void>;

    setUser: (
        user: UserData | null
    ) => void;

    setUsers: (
        users: UserData[]
    ) => void;

    setLoading: (
        loading: boolean
    ) => void;

    setInitialLoading: (
        loading: boolean
    ) => void;

    reset: () => void;
}

const initialState = {
    user: null,
    users: [],

    isAuthenticated: false,
    isInitialLoading: true,
    isLoading: false,
};

export const useAuthStore =
    create<AuthState>()(
        persist(
            (set) => ({
                ...initialState,

                fetchUser: async () => {
                    console.log("fetchUser called");
                    try {
                        set({
                            isLoading: true,
                        });

                        const response =
                            await userService.getMe();

                        set({
                            user:
                                response.data ||
                                null,
                            isAuthenticated:
                                !!response.data,
                        });

                        if (
                            response.data &&
                            !socket.connected
                        ) {
                            socket.connect();
                        }
                    } catch {
                        socket.disconnect();

                        set({
                            user: null,
                            isAuthenticated: false,
                        });
                    } finally {
                        set({
                            isLoading: false,
                            isInitialLoading: false,
                        });
                    }
                },

                setUser: (user) =>
                    set({
                        user,
                        isAuthenticated:
                            !!user,
                    }),

                setUsers: (users) =>
                    set({
                        users,
                    }),

                setLoading: (
                    isLoading
                ) =>
                    set({
                        isLoading,
                    }),

                setInitialLoading: (
                    isInitialLoading
                ) =>
                    set({
                        isInitialLoading,
                    }),

                reset: () =>
                    set({
                        ...initialState,
                        isInitialLoading:
                            false,
                    }),
            }),
            {
                name:
                    "auth-storage",

                storage:
                    createJSONStorage(
                        () =>
                            localStorage
                    ),

                partialize: (
                    state
                ) => ({
                    user: state.user,
                    isAuthenticated:
                        state.isAuthenticated,
                }),
            }
        )
    );
import { create } from "zustand";

interface PresenceState {
    onlineUsers: string[];

    setOnlineUsers: (
        users: string[]
    ) => void;

    addOnlineUser: (
        userId: string
    ) => void;

    removeOnlineUser: (
        userId: string
    ) => void;
}

export const usePresenceStore =
    create<PresenceState>((set) => ({
        onlineUsers: [],

        setOnlineUsers: (
            onlineUsers
        ) =>
            set({
                onlineUsers,
            }),

        addOnlineUser: (
            userId
        ) =>
            set((state) => ({
                onlineUsers: [
                    ...new Set([
                        ...state.onlineUsers,
                        userId,
                    ]),
                ],
            })),

        removeOnlineUser: (
            userId
        ) =>
            set((state) => ({
                onlineUsers:
                    state.onlineUsers.filter(
                        (id) =>
                            id !== userId
                    ),
            })),
    }));
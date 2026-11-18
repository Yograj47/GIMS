import { create } from "zustand";
import type { UserData } from "@/types/user";
import { userService } from "@/features/auth/api/user.service";
import { socket } from "@/features/socket/socket";
import { writeStorage } from "@/lib/browserStorage";

interface AuthState {
    user: UserData | null;
    users: UserData[];
    isAuthenticated: boolean;
    isInitialLoading: boolean;
    isLoading: boolean;
    fetchUser: () => Promise<boolean>;
    setUser: (user: UserData | null) => void;
    setUsers: (users: UserData[]) => void;
    setLoading: (loading: boolean) => void;
    setInitialLoading: (loading: boolean) => void;
    reset: () => void;
}

const initialState = {
    user: null,
    users: [],
    isAuthenticated: false,
    isInitialLoading: true,
    isLoading: false,
};

let revision = 0;
let pendingFetch: Promise<boolean> | undefined;

// Authentication is restored from the HTTP-only cookie. Remove old persisted profile details.
writeStorage("local", "auth-storage", null);

export const useAuthStore = create<AuthState>()((set) => ({
    ...initialState,
    fetchUser: () => {
        if (pendingFetch) return pendingFetch;
        const requestRevision = revision;
        set({ isLoading: true });
        const request = (async () => {
            try {
                const response = await userService.getMe();
                if (requestRevision !== revision) return false;
                const user = response.data?._id ? response.data : null;
                set({ user, isAuthenticated: Boolean(user) });
                if (user?.isVerified && !socket.connected) socket.connect();
                else if (!user?.isVerified) socket.disconnect();
                return Boolean(user);
            } catch {
                if (requestRevision === revision) {
                    socket.disconnect();
                    set({ user: null, users: [], isAuthenticated: false });
                }
                return false;
            } finally {
                if (requestRevision === revision) set({ isLoading: false, isInitialLoading: false });
            }
        })().finally(() => { if (pendingFetch === request) pendingFetch = undefined; });
        pendingFetch = request;
        return request;
    },
    setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
    setUsers: (users) => set({ users }),
    setLoading: (isLoading) => set({ isLoading }),
    setInitialLoading: (isInitialLoading) => set({ isInitialLoading }),
    reset: () => {
        revision++;
        pendingFetch = undefined;
        socket.disconnect();
        writeStorage("local", "auth-storage", null);
        set({ ...initialState, isInitialLoading: false });
    },
}));

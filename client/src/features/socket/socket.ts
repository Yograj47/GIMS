import { io } from "socket.io-client";

export const socket = io(
    import.meta.env.VITE_SOCKET_URL,
    {
        autoConnect: false,
        withCredentials: true,

        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,

        timeout: 10000,
    }
);
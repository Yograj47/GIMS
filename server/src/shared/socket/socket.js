import { Server } from "socket.io";
import { socketAuth } from "./socketAuth";
import { SOCKET_EVENTS } from "./socketEvents";
let io = null;

export const initializeSocket = (
    server
) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    });

    io.use(socketAuth);

    io.on(
        SOCKET_EVENTS.CONNECTION,
        (socket) => {
            console.log(`Socket Connected: ${socket.id}`);

            socket.on(
                SOCKET_EVENTS.DISCONNECT,
                () => {
                    console.log(`Socket Disconnected: ${socket.id}`);
                }
            );
        })

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error(
            "Socket.IO not initialized"
        );
    }

    return io;
};
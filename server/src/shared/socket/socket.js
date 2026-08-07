import { Server } from "socket.io";
import { socketAuth } from "./socketAuth.js";
import { SOCKET_EVENTS } from "./socketEvents.js";
import { joinUserRooms } from "./socketRooms.js";
import {
    addConnection,
    removeConnection,
    getOnlineCount,
    getOnlineUsers,
} from "./socketPresence.js";
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

            joinUserRooms(socket);

            addConnection(
                socket.user.id,
                socket.id
            );

            console.log(
                `Socket Connected: ${socket.user.name}`
            );

            console.log("Online Users:", getOnlineCount());

            socket.on(
                SOCKET_EVENTS.DISCONNECT,
                () => {
                    removeConnection(
                        socket.user.id,
                        socket.id
                    )
                    console.log(
                        `Socket Disconnected: ${socket.id}`
                    );

                    console.log(
                        "Online Users:",
                        getOnlineUsers()
                    )
                }
            );
        }
    );

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
import { Server } from "socket.io";

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

    io.on("connection", (socket) => {
        console.log(
            `Socket Connected: ${socket.id}`
        );

        socket.on(
            "disconnect",

            () => {
                console.log(
                    `Socket Disconnected: ${socket.id}`
                );
            }
        );
    });

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
import { Server } from "socket.io";
import { socketAuth } from "./socketAuth.js";
import { SOCKET_EVENTS } from "./socketEvents.js";
import { joinUserRooms } from "./socketRooms.js";
import { allowedOrigin } from "../middleware/requestSecurity.js";
import { emitEvent } from "./emitter.js"
import {
    addConnection,
    removeConnection,
    getOnlineCount,
} from "./socketPresence.js";
import {
    logInfo,
    logError,
} from "../logger/index.js";
import {
    LOG_CONTEXT,
} from "../constants/index.js";
let io = null;

export const initializeSocket = (
    server
) => {
    io = new Server(server, {
        cors: {
            origin: (origin, callback) => callback(null, Boolean(origin && allowedOrigin(origin))),
            credentials: true,
        },
        allowRequest: (req, callback) => callback(null, !req.headers.origin || allowedOrigin(req.headers.origin)),
    });

    io.use(socketAuth);

    io.engine.on("connection_error", (err) => {
        logError(
            LOG_CONTEXT.SOCKET,
            `Socket auth failed: ${err.message}`
        );
    });

    io.on(
        SOCKET_EVENTS.CONNECTION,
        (socket) => {

            joinUserRooms(socket);
            let expiryTimer;
            function expireSession() {
                const remaining = socket.user.sessionExpiresAt - Date.now();
                if (remaining <= 0) return socket.disconnect(true);
                expiryTimer = setTimeout(expireSession, Math.min(remaining, 2_147_483_647));
                expiryTimer.unref();
            }
            if (socket.user.sessionExpiresAt) expireSession();

            addConnection(
                socket.user.id,
                socket.id
            );

            emitEvent(
                SOCKET_EVENTS.USER_ONLINE,
                {
                    userId: socket.user.id,
                    name: socket.user.name,
                    role: socket.user.role,
                    onlineCount: getOnlineCount(),
                }
            );

            logInfo(
                LOG_CONTEXT.SOCKET,
                `Socket connected: ${socket.user.name}`
            );

            socket.on(
                SOCKET_EVENTS.DISCONNECT,
                () => {
                    clearTimeout(expiryTimer);
                    removeConnection(
                        socket.user.id,
                        socket.id
                    );

                    emitEvent(
                        SOCKET_EVENTS.USER_OFFLINE,
                        {
                            userId: socket.user.id,
                            onlineCount: getOnlineCount(),
                        }
                    );

                    logInfo(
                        LOG_CONTEXT.SOCKET,
                        `Socket disconnected: ${socket.user.name}`
                    );
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

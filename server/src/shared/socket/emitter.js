import { getIO } from "./socket.js";

export const emitEvent = (
    event,
    payload
) => {
    getIO().to("workspace").emit(
        event,
        payload
    );
};

export function disconnectAccountSessions(accountId) {
    let io;
    try { io = getIO(); } catch { return; }
    io.in(`user:${accountId}`).disconnectSockets(true);
}

export const emitToRoom = (
    room,
    event,
    payload
) => {
    getIO()
        .to(room)
        .emit(
            event,
            payload
        );
};

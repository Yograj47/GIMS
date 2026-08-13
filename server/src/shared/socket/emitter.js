import { getIO } from "./socket.js";

export const emitEvent = (
    event,
    payload
) => {
    getIO().emit(
        event,
        payload
    );
};

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
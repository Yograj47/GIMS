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
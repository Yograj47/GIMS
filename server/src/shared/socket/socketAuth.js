import cookie from "cookie";

import { readSession } from "../services/token/session.service.js";

export const socketAuth = async (
    socket,
    next
) => {
    try {
        const cookies = cookie.parse(
            socket.handshake.headers.cookie || ""
        );

        const token = cookies.token;

        if (!token) {
            return next(
                new Error(
                    "Authentication required"
                )
            );
        }

        const user = await readSession(token);
        if (!user.isVerified) return next(new Error("Verify your account first"));

        socket.user = {
            id: user._id.toString(),
            customerId: user.customerId?.toString(),
            role: user.role,
            isVerified:
                user.isVerified,
            name: user.name,
            email: user.email,
            sessionExpiresAt: user.$locals.sessionExpiresAt,
        };

        next();
    } catch (error) {
        next(error);
    }
};

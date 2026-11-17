import jwt from "jsonwebtoken";
import cookie from "cookie";

import User from "../../modules/user/user.model.js";
import { CustomerAccount } from "../../modules/user/customer.model.js";

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

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const model = decoded.role === "customer" ? CustomerAccount : User;
        const user =
            await model.findById(
                decoded.id
            ).select(
                "role isVerified name email customerId"
            );

        if (!user) {
            return next(
                new Error(
                    "User not found"
                )
            );
        }

        if (
            user.role !==
            decoded.role
        ) {
            return next(
                new Error(
                    "Permissions changed"
                )
            );
        }

        socket.user = {
            id: user._id.toString(),
            customerId: user.customerId?.toString(),
            role: user.role,
            isVerified:
                user.isVerified,
            name: user.name,
            email: user.email,
        };

        next();
    } catch (error) {
        next(error);
    }
};

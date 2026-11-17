import asyncHandler from "express-async-handler";
import { readSession } from "../services/token/session.service.js";

export const authenticate = asyncHandler(
    async (req, res, next) => {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const user = await readSession(token);
        res.set("Cache-Control", "no-store");

        req.user = {
            id: user._id,
            customerId: user.customerId,
            counterHistoryBefore: user.counterHistoryBefore,
            role: user.role,
            isVerified: user.isVerified,
        };

        next();
    }
);

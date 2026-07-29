import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "@/modules/users/user.model.js";

export const authenticate = asyncHandler(
    async (req, res, next) => {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(
            decoded.id
        ).select("role isVerified");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.role !== decoded.role) {
            return res.status(403).json({
                success: false,
                message:
                    "Permissions changed. Please login again.",
            });
        }

        req.user = {
            id: user._id,
            role: user.role,
            isVerified: user.isVerified,
        };

        next();
    }
);
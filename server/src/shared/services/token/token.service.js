import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN } from "../../constants/index.js";

export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            version: user.tokenVersion ?? 0,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: JWT_EXPIRES_IN,
            algorithm: "HS256",
        }
    );
};

export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

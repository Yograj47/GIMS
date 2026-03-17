import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.Model.js"

export const userAuth = asyncHandler(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        res.status(401);
        throw new Error("Not authorized, please login");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 1. Fetch the user from DB to get the LATEST role
        const user = await User.findById(decoded.id).select("role isVerified");

        if (!user) {
            res.status(401);
            throw new Error("User no longer exists");
        }

        // 2. CRITICAL CHECK: Compare DB role vs Token role
        if (user.role !== decoded.role) {
            // If the role changed, the token is "stale"
            res.status(403); 
            throw new Error("Your permissions have changed. Please log in again to sync your account.");
        }

        // 3. Attach the fresh data to the request
        req.user = {
            id: user._id,
            role: user.role,
            isVerified: user.isVerified
        };

        next();
    } catch (error) {
        res.status(res.statusCode === 200 ? 401 : res.statusCode);
        throw new Error(error.message || "Unauthorized access");
    }
});
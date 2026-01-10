import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

export const userAuth = asyncHandler(async (req, res, next) => {
    // 1. Safety check for cookie-parser
    if (!req.cookies) {
        console.error("Cookie-parser middleware is not loaded!");
        res.status(500);
        throw new Error("Internal Server Error");
    }

    const { token } = req.cookies;
console.log(req.cookies.token);

    console.log(token);
    

    if (!token) {
        res.status(401);
        throw new Error("Not authorized or token missing");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.id) {
            res.status(401);
            throw new Error("Unauthorized access - invalid token payload");
        }

        // Standard practice: Attach to req.userId or req.user
        req.userId = decoded.id;
        
        next();
    } catch (error) {
        res.status(401);
        throw new Error("Unauthorized access - invalid token");
    }
});
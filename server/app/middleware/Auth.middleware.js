import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

export const userAuth = asyncHandler(async (req, res, next) => {
    if (!req.cookies) {
        res.status(500);
        throw new Error("Internal Server Error");
    }
    
    const { token } = req.cookies;
    
    if (!token) {
        res.status(401);
        throw new Error("Not authorized or token missing");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.id || !decoded.role) {
            res.status(401);
            throw new Error("Unauthorized access - invalid token payload");
        }

        req.user = decoded; 
        
        next();
    } catch (error) {
        res.status(401);
        throw new Error("Unauthorized access - invalid token");
    }
});
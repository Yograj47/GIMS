import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

/**
 * Middleware: `userAuth`
 * - Cookie-only mode: reads the token from `req.cookies.token`.
 * - Verifies the JWT and (per current implementation) assigns the
 *   decoded token's `id` value to `req.body.userId` for downstream handlers.
 * - Responds with 401 when the token is missing, invalid, or the user
 *   referenced by the token does not exist.
 */
export const userAuth = asyncHandler(async (req, res, next) => {
    // Read token from cookie (`req.cookies.token`).
    const { token } = req.cookies;

    if (!token) {
        // No token supplied
        res.status(401);
        throw new Error("Not authorized or token missing");
    }

    try {
        
        // Verify JWT and extract payload (expects `{ id: ... }`)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the id found on the token to `req.body.userId` so
        // existing controllers that expect `req.body.userId` work.
        if (decoded.id) {
            console.log(decoded.id);
            req.userId = decoded.id;    
        } else {
            return res.status(401).json({ message: "Unauthorized access - invalid token" });
        }

        next();
    } catch (error) {
        // Verification failed or other error
        console.error(error);
        res.status(401);
        throw new Error("Unauthorized access - invalid token");
    }
});
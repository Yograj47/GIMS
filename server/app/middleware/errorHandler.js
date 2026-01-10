import { z } from "zod";

const errorHandler = (err, req, res, next) => {
    let statusCode =
        res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

    let message = err.message || "Internal Server Error";

    if (err instanceof z.ZodError) {
        statusCode = 400;
        message = err.errors.map(e => e.message).join(", ");
    }

    res.status(statusCode).json({
        status: "failed",
        message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
};

export default errorHandler;

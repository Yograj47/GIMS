import { z } from "zod";

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Handle Zod Validation Errors
    if (err instanceof z.ZodError) {
        statusCode = 400;
        message = err.errors.map(e => e.message).join(", ");
    }

    res.status(statusCode).json({
        status: "failed",
        message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};

export default errorHandler;
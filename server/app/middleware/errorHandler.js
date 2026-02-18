import { z } from "zod";

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    let message = err.message || "Internal Server Error";

    if (err instanceof z.ZodError) {
        statusCode = 400;
        message = err.errors.map(e => e.message).join(", ");
    } 
    
    else if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors).map(e => e.message).join(", ");
    }

    else if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    res.status(statusCode).json({
        status: "Failed",
        message,
        ...(process.env.NODE_ENV !== "production" && { 
            stack: err.stack,
            originalError: err 
        }),
    });
};

export default errorHandler;
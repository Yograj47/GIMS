import { z } from "zod";

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let status = statusCode >= 500 ? "Error" : "Fail";
    let errors = undefined;

    if (err instanceof z.ZodError || err.name === "ZodError") {
        statusCode = 400;
        status = "Fail";
        message = "Validation Error";
        errors = err.errors.map(e => ({ path: e.path, message: e.message }));
    }
    else if (err.name === "ValidationError") {
        statusCode = 400;
        status = "Fail";
        message = Object.values(err.errors).map(e => e.message).join(", ");
    }
    else if (err.name === "CastError") {
        statusCode = 400;
        status = "Fail";
        message = `Invalid ${err.path}: ${err.value}`;
    }
    else if (err.code === 11000) {
        statusCode = 409;
        status = "Fail";
        message = "Duplicate entry — resource already exists";
    }

    res.status(statusCode).json({
        status,
        message,
        ...(err.errors && { errors: err.errors }),
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
};

export default errorHandler;
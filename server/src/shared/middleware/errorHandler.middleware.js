import { ZodError } from "zod";
import logger from "../logger/logger.js";
import { AppError } from "../errors/index.js";

export const errorHandler = (
    err,
    req,
    res,
    next
) => {
    logger.error(err);

    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: err.issues,
        });
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }

    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "Resource already exists",
        });
    }

    return res.status(500).json({
        success: false,
        message:
            process.env.NODE_ENV === "production"
                ? "Internal server error"
                : err.message,
    });
};
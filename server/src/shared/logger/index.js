import logger from "./logger.js";

export const logInfo = (
    context,
    message,
    meta = {}
) => {
    logger.info({
        context,
        message,
        ...meta,
    });
};

export const logWarn = (
    context,
    message,
    meta = {}
) => {
    logger.warn({
        context,
        message,
        ...meta,
    });
};

export const logError = (
    context,
    message,
    error = null,
    meta = {}
) => {
    logger.error({
        context,
        message,
        error: error?.message,
        stack: error?.stack,
        ...meta,
    });
};
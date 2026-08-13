import {
    logInfo,
    logError,
} from "../shared/logger/index.js";

import {
    LOG_CONTEXT,
} from "../shared/constants/index.js";
import mongoose from "mongoose";

const connectDB = async () => {
    const mongoUri =
        process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error(
            "MONGO_URI is not defined"
        );
    }

    try {
        const conn =
            await mongoose.connect(
                mongoUri
            );

        logInfo(
            LOG_CONTEXT.DATABASE,
            "MongoDB connected",
            {
                host:
                    conn.connection.host,
            }
        );
    } catch (error) {
        logError(
            LOG_CONTEXT.DATABASE,
            "MongoDB connection failed",
            error
        );

        process.exit(1);
    }
};

export default connectDB;
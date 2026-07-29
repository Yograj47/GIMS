import mongoose from "mongoose";
import logger from "../shared/logger/logger";
import { LOG_CONTEXT } from "../shared/constants/index";

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error("MONGO_URI is not defined");
    }

    try {
        const conn = await mongoose.connect(mongoUri);

        logger.info(
            `[${LOG_CONTEXT.DATABASE}]MongoDB Connected: ${conn.connection.host}`
        );
    } catch (error) {
        logger.error(
            `[${LOG_CONTEXT.DATABASE}]MongoDB connection failed: ${error.message}`
        );

        process.exit(1);
    }
};

export default connectDB;
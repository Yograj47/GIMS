import dotenv from "dotenv";
dotenv.config();

import http from "http";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";
import { seedInitialUsers } from "./src/utils/seed.js";
import { initializeSocket } from "./src/shared/socket/socket.js";
import {
    logInfo,
    logError,
} from "./src/shared/logger/index.js";
import {
    LOG_CONTEXT,
} from "./src/shared/constants/index.js";

import morgan from "morgan";

const PORT =
    process.env.PORT || 5000;

app.use(morgan("dev"));

const server =
    http.createServer(app);

initializeSocket(server);

process.on(
    "unhandledRejection",
    (error) => {
        logError(
            LOG_CONTEXT.SERVER,
            "Unhandled Promise Rejection",
            error
        );
        process.exit(1);
    }
);

process.on(
    "uncaughtException",
    (error) => {
        logError(
            LOG_CONTEXT.SERVER,
            "Uncaught Exception",
            error
        );

        process.exit(1);
    }
);

const startServer =
    async () => {
        try {
            await connectDB();

            await seedInitialUsers();

            server.listen(
                PORT,
                () => {
                    logInfo(
                        LOG_CONTEXT.SERVER,
                        "Server started",
                        { port: PORT }
                    );
                }
            );
        } catch (error) {
            logError(
                LOG_CONTEXT.SERVER,
                "Failed to start server",
                error
            );

            process.exit(1);
        }
    };

startServer();
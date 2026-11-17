import "dotenv/config";
import http from "http";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";
import { seedInitialUsers } from "./src/utils/seed.js";
import { initializeSocket } from "./src/shared/socket/socket.js";
import { publishExpiredOnlineOrders } from "./src/modules/checkout/orderWorkflow.js";
import { migrateCustomerAccounts } from "./src/modules/user/customer.migration.js";
import { connectMediaDB } from "./src/config/mediaDb.js";
import { cleanUnusedImageFiles, migrateImageFiles } from "./src/modules/product/media-storage.js";
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

async function checkOnlineOrderExpiry() {
    try {
        await publishExpiredOnlineOrders();
    } catch (error) {
        logError(LOG_CONTEXT.SERVER, "Failed to publish expired online orders", error);
    } finally {
        if (server.listening) setTimeout(checkOnlineOrderExpiry, 30_000).unref();
    }
}

async function cleanMediaFiles() {
    try {
        await cleanUnusedImageFiles();
    } catch {
        logError(LOG_CONTEXT.SERVER, "Could not clean unused image files. Cleanup will retry.");
    } finally {
        if (server.listening) setTimeout(cleanMediaFiles, 60 * 60_000).unref();
    }
}

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
            await connectMediaDB();
            await migrateImageFiles();
            await migrateCustomerAccounts();

            await seedInitialUsers();

            server.listen(
                PORT,
                () => {
                    void checkOnlineOrderExpiry();
                    void cleanMediaFiles();
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

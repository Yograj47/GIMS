import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/config/db.js";
import app from "./src/app.js";
import { seedInitialUsers } from "./src/utils/seed.js";
import http from "http";
import { initializeSocket } from "./src/shared/socket/socket.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initializeSocket(server);

const startServer = async () => {
    try {
        await connectDB();

        await seedInitialUsers();

        server.listen(PORT, () => {
            console.log(
                `Server running on port ${PORT}`
            );
        });
    } catch (error) {
        console.error(
            "Failed to start server",
            error
        );

        process.exit(1);
    }
};
startServer();
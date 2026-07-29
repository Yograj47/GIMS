import dotenv from "dotenv";
dotenv.config();

import connectDB from "./app/config/db.js";
import app from "./app/app.js";
import { seedInitialUsers } from "./app/utils/seed.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    await seedInitialUsers();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
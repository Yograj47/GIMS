import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { API, ROUTES } from "./shared/constants/index.js";
import { errorHandler } from "./shared/middleware/index.js";

import authRoutes from "./modules/auth/auth.route.js";
import userRoutes from "./modules/user/user.route.js";
import categoryRoutes from "./modules/category/category.route.js";

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(
    cors({
        origin:
            process.env.CLIENT_URL ||
            "http://localhost:5173",
        credentials: true,
    })
);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Grocery Pro API",
    });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/
app.use(`${API}${ROUTES.AUTH}`, authRoutes);
app.use(`${API}${ROUTES.USERS}`, userRoutes);
app.use(`${API}${ROUTES.INVENTORY.CATEGORIES}`, categoryRoutes);

/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

app.use(errorHandler);

export default app;
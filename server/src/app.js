import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { API, ROUTES } from "./shared/constants/index.js";
import { errorHandler } from "./shared/middleware/index.js";

import authRoutes from "./modules/auth/auth.route.js";
import userRoutes from "./modules/user/user.route.js";
import categoryRoutes from "./modules/category/category.route.js";
import supplierRoutes from "./modules/supplier/supplier.route.js";
import unitRoutes from "./modules/unit/unit.route.js";
import productUnitRoutes from "./modules/product-unit/product-unit.route.js";
import productRoutes from "./modules/product/product.route.js";
import movementRoutes from "./modules/movement/movement.route.js";
import transactionRoutes from "./modules/transaction/transaction.route.js";
import alertRoutes from "./modules/alert/alert.route.js";
import settingRoute from "./modules/setting/setting.route.js";
import activityLogRoute from "./modules/activity-log/activity-log.route.js";

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
app.use(`${API}${ROUTES.INVENTORY.SUPPLIERS}`, supplierRoutes);
app.use(`${API}${ROUTES.INVENTORY.UNITS}`, unitRoutes);
app.use(`${API}${ROUTES.INVENTORY.PRODUCT_UNITS}`, productUnitRoutes);
app.use(`${API}${ROUTES.INVENTORY.PRODUCTS}`, productRoutes);
app.use(`${API}${ROUTES.MOVEMENTS}`, movementRoutes);
app.use(`${API}${ROUTES.TRANSACTIONS}`, transactionRoutes);
app.use(`${API}${ROUTES.ALERTS}`, alertRoutes);
app.use(`${API}${ROUTES.SETTINGS}`, settingRoute);
app.use(`${API}${ROUTES.ACTIVITY_LOGS}`, activityLogRoute);

/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

app.use(errorHandler);

export default app;
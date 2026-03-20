// Import Packages and Configurations
import express from "express"
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler.js"
import cors from "cors"

// Import Routes
import SettingRoutes from "./routes/Setting.Route.js"
import UserRoutes from "./routes/User.Route.js"
import AuthRoutes from "./routes/Auth.Route.js"
import CategoryRoutes from "./routes/Category.Route.js"
import UnitRoutes from "./routes/Unit.Route.js"
import ProductRoutes from "./routes/Product.Route.js"
import SupplierRoutes from "./routes/Supplier.Route.js"
import MovementTransactionRoutes from "./routes/MovementTransaction.Route.js"
import ActivityLogRoutes from "./routes/ActivityLog.Route.js"
import AlertRoutes from "./routes/Alert.Route.js"
import ProductUnitRoutes from "./routes/ProductUnit.Route.js"
import AnalyticsRoutes from "./routes/Analytics.routes.js";
import { injectSettings } from "./middleware/Setting.middleware.js";

const app = express();

// Body parser middleware and Cookie parser
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

// Test Route
app.get("/", (req, res) => {
    res.send("Hello World!!")
})

const API = "/api/v1"

// Routes
app.use(`${API}/auths`, AuthRoutes);
app.use(`${API}/users`, UserRoutes);
app.use(`${API}/categories`, CategoryRoutes);
app.use(`${API}/units`, UnitRoutes);
app.use(`${API}/products`, ProductRoutes)
app.use(`${API}/suppliers`, SupplierRoutes);
app.use(`${API}/product-units`, ProductUnitRoutes);
app.use(`${API}`, MovementTransactionRoutes);
app.use(`${API}/activity-logs`, ActivityLogRoutes);
app.use(`${API}/alerts`, AlertRoutes);
app.use(`${API}/settings`, SettingRoutes);
app.use(`${API}/product-units`, ProductUnitRoutes);
app.use(`${API}/analytics`, AnalyticsRoutes);

// Error Middleware
app.use(errorHandler, injectSettings);

export default app;
// Import Packages and Configurations
import express from "express"
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler.js"
import cors from "cors"

// Import Routes
import userRoutes from "./routes/User.Route.js"
import authRoutes from "./routes/Auth.Route.js"
import categoryRoutes from "./routes/Category.Route.js"
import unitRoutes from "./routes/Unit.Route.js"
import productRoutes from "./routes/Product.Route.js"
import supplierRoutes from "./routes/Supplier.Route.js"
import stockMovementRoutes from "./routes/StockMovement.Route.js"
import transactionRoutes from "./routes/Transaction.Route.js"
import activityLogRoutes from "./routes/ActivityLog.Route.js"
import alertRoutes from "./routes/Alert.Route.js"

const app = express();

// Body parser middleware and Cookie parser
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

// Test Route
app.get("/", (req, res) => {
    res.send("Hello World!!")
})

const API = "/api/v1"

// Routes
app.use(`${API}/auths`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/categories`, categoryRoutes);
app.use(`${API}/units`, unitRoutes);
app.use(`${API}/products`, productRoutes)
app.use(`${API}/suppliers`, supplierRoutes);
app.use(`${API}/stock-movements`, stockMovementRoutes);
app.use(`${API}/transactions`, transactionRoutes);
app.use(`${API}/activity-logs`, activityLogRoutes);
app.use(`${API}/alerts`, alertRoutes);

// Error Middleware
app.use(errorHandler);

export default app;
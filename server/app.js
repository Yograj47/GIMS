// Import Packages and Configurations
import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";

// Import Custom Middleware
import errorHandler from "./middleware/errorHandler.js"

// Import Routes
import userRoutes from "./routes/User.Route.js"
import authRoutes from "./routes/Auth.Route.js"
import categoryRoutes from "./routes/Category.Route.js"
import unitRoutes from "./routes/Unit.Route.js"
import productRoutes from "./routes/Product.Route.js"

// Configurations
dotenv.config();
connectDB();
const app = express()
const PORT = process.env.PORT || 5000

// Body parser middleware and Cookie parser
app.use(express.json());
app.use(cookieParser());

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

// Error Middleware
app.use(errorHandler);

// Running server 
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
// Import Packages and Configurations
import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js";
import userRoutes from "./routes/User.Routes.js"
import errorHandler from "./middleware/errorHandler.js"
import cookieParser from "cookie-parser";

// Configurations
dotenv.config();
connectDB();
const app = express()
const PORT = process.env.PORT || 5000

// Body parser middleware and Cookie parser
app.use(express.json());
app.use(cookieParser());

// Test Route
app.get("/", (req,res) => {
    res.send("Hello World!!")
})

// Routes
app.use("/api/v1/users", userRoutes)

// Error Middleware
app.use(errorHandler)

// Running server 
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
})
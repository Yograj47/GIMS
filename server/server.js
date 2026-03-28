// Import Packages 
import dotenv from "dotenv"
import connectDB from "./app/config/db.js";
import app from "./app/app.js";

// Configurations
dotenv.config();
connectDB();
const PORT = process.env.PORT || 5000

// Running server 
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
});
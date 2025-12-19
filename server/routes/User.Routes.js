// routes/User.Routes.js
import express from "express"
import { registerUser, loginUser } from "../controllers/User.Controller.js"

// Initialize Router
const router = express.Router();

// Define Routes
router.post("/",registerUser);
router.post("/login",loginUser);

export default router
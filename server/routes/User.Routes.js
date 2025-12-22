// routes/User.Routes.js
import express from "express"
import { registerUser, loginUser,sendVerifyOtp,verifyEmail } from "../controllers/User.Controller.js"
import { userAuth } from "../middleware/userAuth.js"

// Initialize Router
const router = express.Router();

// Define Routes
router.post("/",registerUser);
router.post("/login",loginUser);
router.post('/send-verify-opt', userAuth, sendVerifyOtp); 
router.post('/verify-email', userAuth, verifyEmail);

export default router
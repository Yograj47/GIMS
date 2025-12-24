// routes/User.Routes.js
import express from "express"
import { registerUser, loginUser, verifyEmail, logoutUser, sendVerifyOtp, resetPasswordOtp, resetPassword} from "../controllers/Auth.Controller.js"
import { userAuth } from "../middleware/userAuth.js"

// Initialize Router
const router = express.Router();

// Define Routes
router.post("/", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post('/send-verify-opt', userAuth, sendVerifyOtp);
router.post('/verify-email', userAuth, verifyEmail);
router.post('/reset-password-otp', resetPasswordOtp);
router.post('/reset-password', resetPassword);

export default router
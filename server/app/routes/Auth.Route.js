import express from "express";
import {
    registerUser,
    loginUser,
    verifyEmail,
    logoutUser,
    sendVerifyOtp,
    resetPasswordOtp,
    resetPassword
} from "../controllers/Auth.Controller.js";
import { userAuth } from "../middleware/userAuth.js";

const router = express.Router();

// Authentication / Management
router.post("/", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// Verification (Protected)
router.post('/send-verify-otp', userAuth, sendVerifyOtp);
router.post('/verify-account', userAuth, verifyEmail);

// Password Recovery
router.post('/reset-password-otp', resetPasswordOtp);
router.post('/reset-password', resetPassword);

export default router;
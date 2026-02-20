import express from "express";
import {
    registerUser,
    loginUser,
    verifyEmail,
    logoutUser,
    sendVerifyOtp,
    resetPasswordOtp,
    resetPassword,
    updateRole
} from "../controllers/Auth.Controller.js";
import { userAuth } from "../middleware/Auth.middleware.js";
import rbac from "../middleware/Role.middleware.js";

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

// Update Role (Admin only)
router.put('/role/:id', userAuth, rbac("all"), updateRole);

export default router;
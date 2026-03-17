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

// Verification (Protected)
router.post("/logout", userAuth, logoutUser);
router.post('/send-verify-otp', userAuth, sendVerifyOtp);
router.post('/verify-account', userAuth, verifyEmail);

// Password Recovery
router.post('/reset-password-otp', resetPasswordOtp);
router.post('/reset-password', resetPassword);

router.put('/role/:id', userAuth, rbac("user:write"), updateRole);

export default router;
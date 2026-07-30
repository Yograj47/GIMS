import { Router } from "express";

import * as authController from "./auth.controller.js";

import {
    authenticate,
    authorize,
} from "../../shared/middleware/index.js";

import {
    PERMISSIONS
} from "../../shared/constants/index.js";

const router = Router();

// Public
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

router.post(
    "/forgot-password",
    authController.resetPasswordOtp
);

router.post(
    "/reset-password",
    authController.resetPassword
);

// Protected
router.post(
    "/logout",
    authenticate,
    authController.logoutUser
);

router.post(
    "/verify-otp",
    authenticate,
    authController.sendVerifyOtp
);

router.post(
    "/verify-email",
    authenticate,
    authController.verifyEmail
);

// User Management
router.patch(
    "/users/:id/role",
    authenticate,
    authorize(PERMISSIONS.USER_WRITE),
    authController.updateRole
);

router.delete(
    "/users/:id",
    authenticate,
    authorize(PERMISSIONS.USER_DELETE),
    authController.removeUser
);

export default router;
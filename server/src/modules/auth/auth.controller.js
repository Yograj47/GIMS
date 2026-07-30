// src/modules/auth/auth.controller.js

import asyncHandler from "express-async-handler";

import * as authService from "./auth.service.js";

import {
    registerSchema,
    loginSchema,
    resetPasswordSchema,
    updateRoleSchema,
} from "../user/user.validation.js";

import { successResponse } from "../../shared/utils/response.js";

import { COOKIE_OPTIONS } from "../../shared/constants/index.js";

export const registerUser = asyncHandler(async (req, res) => {
    const payload = registerSchema.parse(req.body);

    const { token } = await authService.registerUser(payload);

    res.cookie("token", token, COOKIE_OPTIONS);

    return successResponse(res, {
        statusCode: 201,
        message: "User registered successfully",
    });
});

export const loginUser = asyncHandler(async (req, res) => {
    const payload = loginSchema.parse(req.body);

    const { token } = await authService.loginUser(payload);

    res.cookie("token", token, COOKIE_OPTIONS);

    return successResponse(res, {
        message: "User logged in successfully",
    });
});

export const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie("token", COOKIE_OPTIONS);

    return successResponse(res, {
        message: "Logged out successfully",
    });
});

export const sendVerifyOtp = asyncHandler(async (req, res) => {
    await authService.sendVerifyOtp(req.user.id);

    return successResponse(res, {
        message: "OTP sent successfully",
    });
});

export const verifyEmail = asyncHandler(async (req, res) => {
    const { otp } = req.body;

    await authService.verifyEmail({
        userId: req.user.id,
        otp,
    });

    return successResponse(res, {
        message: "Email verified successfully",
    });
});

export const resetPasswordOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const result = await authService.resetPasswordOtp(email);

    return successResponse(res, {
        message: "Reset OTP sent successfully",
    });
});

export const resetPassword = asyncHandler(async (req, res) => {
    const payload = resetPasswordSchema.parse(req.body);

    await authService.resetPassword(payload);

    return successResponse(res, {
        message: "Password reset successfully",
    });
});

export const updateRole = asyncHandler(async (req, res) => {
    const { role } = updateRoleSchema.parse(req.body);

    const user = await authService.updateRole({
        currentUserId: req.user.id,
        targetUserId: req.params.id,
        role,
    });

    return successResponse(res, {
        message: "Role updated successfully",
        data: user,
    });
});

export const removeUser = asyncHandler(async (req, res) => {
    await authService.removeUser({
        currentUserId: req.user.id,
        targetUserId: req.params.id,
    });

    return successResponse(res, {
        message: "User removed successfully",
    });
});
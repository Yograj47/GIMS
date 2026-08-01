import asyncHandler from "express-async-handler";

import * as userService from "./user.service.js";
import { changePasswordSchema, updateProfileSchema } from "./user.validation.js"

export const getMe = asyncHandler(async (req, res) => {
    const user = await userService.findMe(req.user.id);

    res.status(200).json({
        success: true,
        data: user,
    });
});

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await userService.findAllUsers();

    res.status(200).json({
        success: true,
        data: users,
    });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const payload = updateProfileSchema.parse(req.body);

    const user = await userService.updateProfile(
        req.user.id,
        payload
    );

    res.status(200).json({
        success: true,
        data: user,
    });
});

export const updatePassword = asyncHandler(async (req, res) => {
    const payload = changePasswordSchema.parse(req.body);

    await userService.updatePassword({
        userId: req.user.id,
        ...payload,
    });

    res.status(200).json({
        success: true,
        message: "Password updated successfully",
    });
});
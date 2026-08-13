import asyncHandler from "express-async-handler";
import * as userService from "./user.service.js";
import { changePasswordSchema, updateProfileSchema } from "./user.validation.js"
import { successResponse } from "../../shared/utils/response.js";
import {
    logInfo,
} from "../../shared/logger/index.js";
import {
    LOG_CONTEXT,
} from "../../shared/constants/index.js";

export const getMe = asyncHandler(async (req, res) => {
    const user = await userService.findMe(req.user.id);

    return successResponse(res, {
        statusCode: 200,
        data: user,
        message: "User fetched successfully"
    });
});

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await userService.findAllUsers();

    return successResponse(res, {
        statusCode: 200,
        data: users,
        message: "Users fetched successfully"
    });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const payload = updateProfileSchema.parse(req.body);

    const user =
        await userService.updateProfile(
            req.user.id,
            payload
        );

    logInfo(
        LOG_CONTEXT.AUTH,
        `Profile updated: ${user.email}`
    );

    return successResponse(res, {
        statusCode: 200,
        data: user,
        message:
            "Profile updated successfully",
    });
});

export const updatePassword = asyncHandler(async (req, res) => {
    const payload = changePasswordSchema.parse(req.body);

    await userService.updatePassword({
        userId: req.user.id,
        ...payload,
    });

    logInfo(
        LOG_CONTEXT.AUTH,
        `Password updated: ${req.user.email || req.user.id}`
    );

    return successResponse(res, {
        statusCode: 200,
        message:
            "Password updated successfully",
    });
});
import asyncHandler from "express-async-handler";
import * as settingService from "./setting.service.js";
import { successResponse } from "../../shared/utils/response.js";
import {
    logInfo,
} from "../../shared/logger/index.js";
import {
    LOG_CONTEXT,
} from "../../shared/constants/index.js";

export const findSettings = asyncHandler(async (req, res) => {
    const settings =
        await settingService.find();

    return successResponse(res, {
        data: settings,
    });
});

export const updateSettings = asyncHandler(async (req, res) => {
    const settings =
        await settingService.update(
            req.body
        );

    logInfo(
        LOG_CONTEXT.SYSTEM,
        "Application settings updated"
    );

    return successResponse(res, {
        message:
            "Settings updated successfully",
        data: settings,
    });
});
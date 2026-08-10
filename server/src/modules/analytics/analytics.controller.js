import asyncHandler from "express-async-handler";

import * as analyticsService from "./analytics.service.js";

import {
    successResponse,
} from "../../shared/utils/response.js";

export const getDashboardSummary =
    asyncHandler(async (req, res) => {
        const summary =
            await analyticsService.getDashboardSummary();

        return successResponse(
            res,
            {
                data: summary,
            }
        );
    });

export const getWeeklyMovementStats =
    asyncHandler(async (req, res) => {
        const stats =
            await analyticsService.getWeeklyMovementStats();

        return successResponse(
            res,
            {
                data: stats,
            }
        );
    });
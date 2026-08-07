import asyncHandler from "express-async-handler";

import * as alertService from "./alert.service.js";
import { successResponse } from "../../shared/utils/response.js";

export const findActiveAlerts =
    asyncHandler(async (req, res) => {
        const alerts =
            await alertService.findActive();

        return successResponse(res, {
            data: alerts,
        });
    });

export const findAlerts =
    asyncHandler(async (req, res) => {
        const page =
            Number(req.query.page) || 1;

        const limit =
            Number(req.query.limit) || 100;

        const shouldPaginate =
            req.query.paginate !==
            "false";

        const result =
            await alertService.findAll(
                page,
                limit,
                shouldPaginate
            );

        return successResponse(res, {
            data: result.items,
            meta: result.meta,
        });
    });

export const acknowledgeAlert =
    asyncHandler(async (req, res) => {
        const alert = await alertService.acknowledge(
            req.params.id,
            req.user.id
        );

        return successResponse(res, {
            message: "Alert acknowledged",
            data: alert,
        });
    });
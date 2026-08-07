import asyncHandler from "express-async-handler";

import * as alertService from "./alert.service.js";

export const findActiveAlerts =
    asyncHandler(async (req, res) => {
        const alerts =
            await alertService.findActive();

        res.status(200).json({
            success: true,
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

        res.status(200).json({
            success: true,
            data: result.items,
            meta: result.meta,
        });
    });

export const acknowledgeAlert =
    asyncHandler(async (req, res) => {
        const alert =
            await alertService.acknowledge(
                req.params.id,
                req.user.id
            );

        if (!alert) {
            return res.status(404).json({
                success: false,
                message:
                    "Alert not found",
            });
        }

        res.status(200).json({
            success: true,
            message:
                "Alert acknowledged",
            data: alert,
        });
    });
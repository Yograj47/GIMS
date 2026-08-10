import asyncHandler from "express-async-handler";

import {
    createUnitSchema,
    updateUnitSchema,
} from "./unit.validation.js";
import * as unitService from "./unit.service.js";
import { successResponse } from "../../shared/utils/response.js";
import {
    logInfo,
} from "../../shared/logger/index.js";
import {
    LOG_CONTEXT,
} from "../../shared/constants/index.js";

export const createUnit = asyncHandler(
    async (req, res) => {
        const payload =
            createUnitSchema.parse(req.body);

        const unit =
            await unitService.create(payload);

        logInfo(
            LOG_CONTEXT.INVENTORY,
            `Unit created: ${unit.name}`
        );

        return successResponse(res, {
            statusCode: 201,
            message: "Unit created successfully",
            data: unit,
        });
    }
);

export const getUnits = asyncHandler(
    async (req, res) => {
        const result =
            await unitService.find({
                page:
                    Number(req.query.page) || 1,
                limit:
                    Number(req.query.limit) ||
                    100,
                search:
                    req.query.search || "",
                paginate:
                    req.query.paginate !==
                    "false",
            });

        return successResponse(res, {
            statusCode: 200,
            data: result.units,
            meta: result.meta,
        });
    }
);

export const getUnitById = asyncHandler(
    async (req, res) => {
        const unit = await unitService.findById(
            req.params.id
        );

        return successResponse(res, {
            statusCode: 200,
            data: unit,
        });
    }
);

export const updateUnitById = asyncHandler(async (req, res) => {
    const payload =
        updateUnitSchema.parse(
            req.body
        );

    const unit =
        await unitService.update(
            req.params.id,
            payload
        );

    logInfo(
        LOG_CONTEXT.INVENTORY,
        `Unit updated: ${unit.name}`
    );

    return successResponse(res, {
        statusCode: 200,
        message: "Unit updated successfully",
        data: unit,
    });
});

export const deleteUnitById = asyncHandler(async (req, res) => {
    await unitService.remove(req.params.id);

    logInfo(
        LOG_CONTEXT.INVENTORY,
        `Unit deactivated: ${req.params.id}`
    );

    return successResponse(res, {
        statusCode: 200,
        message: "Unit deleted successfully",
    });
});
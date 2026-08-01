import asyncHandler from "express-async-handler";

import {
    createUnitSchema,
    updateUnitSchema,
} from "./unit.validation.js";

import {
    createUnit,
    getAllUnits,
    getUnit,
    updateUnit,
    removeUnit,
} from "./unit.service.js";

export const createUnit = asyncHandler(
    async (req, res) => {
        const payload =
            createUnitSchema.parse(req.body);

        const unit =
            await createUnit(payload);

        res.status(201).json({
            success: true,
            data: unit,
        });
    }
);

export const getUnits = asyncHandler(
    async (req, res) => {
        const result =
            await getAllUnits({
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

        res.status(200).json({
            success: true,
            data: result.units,
            meta: result.meta,
        });
    }
);

export const getUnitById = asyncHandler(
    async (req, res) => {
        const unit = await getUnit(
            req.params.id
        );

        res.status(200).json({
            success: true,
            data: unit,
        });
    }
);

export const updateUnitById =
    asyncHandler(async (req, res) => {
        const payload =
            updateUnitSchema.parse(
                req.body
            );

        const unit =
            await updateUnit(
                req.params.id,
                payload
            );

        res.status(200).json({
            success: true,
            data: unit,
        });
    });

export const deleteUnitById =
    asyncHandler(async (req, res) => {
        await removeUnit(req.params.id);

        res.status(200).json({
            success: true,
            message:
                "Unit deleted successfully",
        });
    });
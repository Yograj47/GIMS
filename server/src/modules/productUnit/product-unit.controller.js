import asyncHandler from "express-async-handler";

import * as productUnitService from "./product-unit.service.js";

export const getAllProductUnits = asyncHandler(
    async (req, res) => {
        const productUnits =
            await productUnitService.find();

        res.status(200).json({
            success: true,
            data: productUnits,
        });
    }
);

export const createProductUnit =
    asyncHandler(async (req, res) => {
        const productUnit =
            await productUnitService.create(
                req.body
            );

        res.status(201).json({
            success: true,
            message:
                "Product unit created successfully",
            data: productUnit,
        });
    });

export const updateProductUnit =
    asyncHandler(async (req, res) => {
        const productUnit =
            await productUnitService.update({
                id: req.params.id,
                payload: req.body,
            });

        res.status(200).json({
            success: true,
            message:
                "Product unit updated successfully",
            data: productUnit,
        });
    });

export const deleteProductUnit =
    asyncHandler(async (req, res) => {
        await productUnitService.remove(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message:
                "Product unit deleted successfully",
        });
    });
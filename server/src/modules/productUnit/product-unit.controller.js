import asyncHandler from "express-async-handler";

import * as ProductUnitService from "./product-unit.service.js";
import {
    createProductUnitSchema,
    updateProductUnitSchema,
} from "./product-unit.validation.js";
import { successResponse } from "../../shared/utils/response.js";

export const createProductUnit = asyncHandler(
    async (req, res) => {
        const payload =
            createProductUnitSchema.parse(
                req.body
            );

        const productUnit =
            await ProductUnitService.create(
                payload
            );

        return successResponse(res, {
            data: productUnit,
            statusCode: 201,
            message: "Product unit created successfully",
        });
    }
);

export const findProductUnits = asyncHandler(
    async (req, res) => {
        const result =
            await ProductUnitService.find({
                page: Number(
                    req.query.page
                ) || 1,
                limit: Number(
                    req.query.limit
                ) || 10,
                search:
                    req.query.search ||
                    "",
                paginate:
                    req.query.paginate !==
                    "false",
            });

        return successResponse(res, {
            statusCode: 200,
            data: result.items,
            meta: result.paginate
                ? {
                    totalItems:
                        result.totalItems,
                    currentPage:
                        result.page,
                    totalPages:
                        Math.ceil(
                            result.totalItems /
                            result.limit
                        ),
                    itemsPerPage:
                        result.items.length,
                }
                : {
                    totalItems:
                        result.totalItems,
                    paginationDisabled:
                        true,
                },
        });
    }
);

export const findProductUnitById =
    asyncHandler(
        async (req, res) => {
            const productUnit =
                await ProductUnitService.findById(
                    req.params.id
                );

            return successResponse(res, {
                statusCode: 200,
                data: productUnit,
            });
        }
    );

export const updateProductUnit = asyncHandler(
    async (req, res) => {
        const payload =
            updateProductUnitSchema.parse(
                req.body
            );

        const productUnit =
            await ProductUnitService.update(
                req.params.id,
                payload
            );

        return successResponse(res, {
            statusCode: 200,
            message: "Product unit updated successfully",
            data: productUnit,
        });
    }
);

export const removeProductUnit = asyncHandler(
    async (req, res) => {
        await ProductUnitService.remove(
            req.params.id
        );

        return successResponse(res, {
            statusCode: 200,
            message: "Product unit deleted successfully",
        });
    }
);
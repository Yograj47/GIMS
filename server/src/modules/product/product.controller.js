import asyncHandler from "express-async-handler";

import * as ProductService from "./product.service.js";

import {
    createProductSchema,
    updateProductSchema,
} from "./product.validation.js";

export const createProduct = asyncHandler(
    async (req, res) => {
        const payload =
            createProductSchema.parse(
                req.body
            );

        const product =
            await ProductService.create(
                payload
            );

        res.status(201).json({
            success: true,
            data: product,
        });
    }
);

export const findProducts = asyncHandler(
    async (req, res) => {
        const result =
            await ProductService.find({
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

        res.status(200).json({
            success: true,
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

export const findProductById =
    asyncHandler(
        async (req, res) => {
            const product =
                await ProductService.findById(
                    req.params.id
                );

            res.status(200).json({
                success: true,
                data: product,
            });
        }
    );

export const updateProduct = asyncHandler(
    async (req, res) => {
        const payload =
            updateProductSchema.parse(
                req.body
            );

        const product =
            await ProductService.update(
                req.params.id,
                payload
            );

        res.status(200).json({
            success: true,
            message:
                "Product updated successfully",
            data: product,
        });
    }
);

export const removeProduct = asyncHandler(
    async (req, res) => {
        await ProductService.remove(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message:
                "Product deleted successfully",
        });
    }
);
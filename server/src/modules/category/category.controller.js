import asyncHandler from "express-async-handler";

import {
    createCategorySchema,
    updateCategorySchema,
} from "./category.validation.js";

import * as categoryService from "./category.service.js";

export const createCategory = asyncHandler(
    async (req, res) => {
        const payload =
            createCategorySchema.parse(req.body);

        const category =
            await categoryService.create(payload);

        res.status(201).json({
            success: true,
            data: category,
        });
    }
);

export const findCategories = asyncHandler(
    async (req, res) => {
        const result =
            await categoryService.find({
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 100,
                search: req.query.search || "",
                paginate:
                    req.query.paginate !== "false",
            });

        const {
            items,
            totalItems,
            page,
            limit,
            paginate,
        } = result;

        res.status(200).json({
            success: true,
            data: items,
            meta: paginate
                ? {
                    totalItems,
                    itemsPerPage: items.length,
                    currentPage: page,
                    totalPages: Math.ceil(
                        totalItems / limit
                    ),
                }
                : {
                    totalItems,
                    itemsPerPage: items.length,
                    paginationDisabled: true,
                },
        });
    }
);

export const findCategoryById = asyncHandler(
    async (req, res) => {
        const category =
            await categoryService.findById(
                req.params.id
            );

        res.status(200).json({
            success: true,
            data: category,
        });
    }
);

export const updateCategory = asyncHandler(
    async (req, res) => {
        const payload =
            updateCategorySchema.parse(req.body);

        const category =
            await categoryService.update(
                req.params.id,
                payload
            );

        res.status(200).json({
            success: true,
            message:
                "Category updated successfully",
            data: category,
        });
    }
);

export const deleteCategory = asyncHandler(
    async (req, res) => {
        await categoryService.remove(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message:
                "Category removed successfully",
        });
    }
);
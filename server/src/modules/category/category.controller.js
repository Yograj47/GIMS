import asyncHandler from "express-async-handler";
import {
    createCategorySchema,
    updateCategorySchema,
} from "./category.validation.js";
import * as categoryService from "./category.service.js";
import {
    logInfo,
} from "../../shared/logger/index.js";
import {
    LOG_CONTEXT,
} from "../../shared/constants/index.js";
import { successResponse } from "../../shared/utils/response.js";

export const createCategory = asyncHandler(
    async (req, res) => {
        const payload =
            createCategorySchema.parse(req.body);

        const category =
            await categoryService.create(payload);

        logInfo(
            LOG_CONTEXT.INVENTORY,
            `Category created: ${category.name}`
        );

        return successResponse(res, {
            statusCode: 201,
            message: "Category created successfully",
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

        return successResponse(res, {
            data: items,
            meta: paginate
                ? {
                    totalItems,
                    itemsPerPage: items.length,
                    currentPage: page,
                    totalPages: Math.ceil(totalItems / limit),
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

        return successResponse(res, {
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

        logInfo(
            LOG_CONTEXT.INVENTORY,
            `Category updated: ${category.name}`
        );

        return successResponse(res, {
            message: "Category updated successfully",
            data: category,
        });
    }
);

export const deleteCategory = asyncHandler(
    async (req, res) => {
        await categoryService.remove(
            req.params.id
        );

        logInfo(
            LOG_CONTEXT.INVENTORY,
            `Category deleted: ${req.params.id}`
        );

        return successResponse(res, {
            message: "Category removed successfully",
        });
    }
);
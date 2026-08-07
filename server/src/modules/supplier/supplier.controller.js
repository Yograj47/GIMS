import asyncHandler from "express-async-handler";

import {
    createSupplierSchema,
    updateSupplierSchema,
} from "./supplier.validation.js";
import * as supplierService from "./supplier.service.js";
import { successResponse } from "../../shared/utils/response.js";

export const createSupplier = asyncHandler(
    async (req, res) => {
        const payload =
            createSupplierSchema.parse(
                req.body
            );

        const supplier =
            await supplierService.create(
                payload
            );

        return successResponse(res, {
            statusCode: 201,
            message: "Supplier created successfully",
            data: supplier,
        });
    }
);

export const getSuppliers = asyncHandler(
    async (req, res) => {
        const result =
            await supplierService.findAll({
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
            data: result.suppliers,
            meta: result.meta,
        });
    }
);

export const getSupplierById = asyncHandler(
    async (req, res) => {
        const result =
            await supplierService.findById(
                req.params.id
            );

        return successResponse(res, {
            statusCode: 200,
            data: result.supplier,
            meta: {
                products: result.products,
            },
        });
    }
);

export const updateSupplier = asyncHandler(
    async (req, res) => {
        const payload =
            updateSupplierSchema.parse(
                req.body
            );

        const supplier =
            await supplierService.update(
                req.params.id,
                payload
            );

        return successResponse(res, {
            statusCode: 200,
            message: "Supplier updated successfully",
            data: supplier,
        });
    }
);

export const assignProductsToSupplier =
    asyncHandler(async (req, res) => {
        const { productIds } = req.body;

        const result =
            await supplierService.assignProducts(
                {
                    supplierId:
                        req.params.id,
                    productIds,
                }
            );

        return successResponse(res, {
            statusCode: 200,
            message: `${result.modifiedCount} products assigned successfully`,
            data: {
                modifiedCount:
                    result.modifiedCount,
            },
        });
    });

export const unassignProduct = asyncHandler(
    async (req, res) => {
        await supplierService.unassignProduct(
            req.params.productId
        );

        return successResponse(res, {
            statusCode: 200,
            message: "Product unassigned successfully",
        });
    }
);

export const deleteSupplier = asyncHandler(
    async (req, res) => {
        await supplierService.remove(
            req.params.id
        );

        return successResponse(res, {
            statusCode: 200,
            message: "Supplier deleted successfully",
        });
    }
);
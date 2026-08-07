import asyncHandler from "express-async-handler";

import { createTransactionSchema } from "./transaction.validation.js";
import * as transactionService from "./transaction.service.js";
import { successResponse } from "../../shared/utils/response.js";

export const createTransaction = asyncHandler(
    async (req, res) => {
        const payload =
            createTransactionSchema.parse(
                req.body
            );

        const transaction =
            await transactionService.create(
                payload,
                req.user.id
            );

        return successResponse(res, {
            statusCode: 201,
            message: "Transaction created successfully",
            data: transaction,
        });
    }
);

export const findTransactions = asyncHandler(
    async (req, res) => {
        const result =
            await transactionService.find({
                page: Number(
                    req.query.page
                ) || 1,
                limit: Number(
                    req.query.limit
                ) || 100,
                paginate:
                    req.query.paginate !==
                    "false",
            });

        const {
            items,
            totalItems,
            page,
            limit,
            paginate,
        } = result;

        return successResponse(res, {
            statusCode: 200,
            data: items,
            meta: paginate
                ? {
                    totalItems,
                    itemsPerPage:
                        items.length,
                    currentPage: page,
                    totalPages:
                        Math.ceil(
                            totalItems / limit
                        ),
                }
                : {
                    totalItems,
                    itemsPerPage:
                        items.length,
                    paginationDisabled:
                        true,
                },
        });
    }
);

export const findTransactionById = asyncHandler(
    async (req, res) => {
        const transaction =
            await transactionService.findById(
                req.params.id
            );

        return successResponse(res, {
            statusCode: 200,
            data: transaction,
        });
    }
);
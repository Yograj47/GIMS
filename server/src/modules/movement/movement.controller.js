import asyncHandler from "express-async-handler";
import { successResponse } from "../../shared/utils/response.js";
import * as movementService from "./movement.service.js";

export const findMovements = asyncHandler(
    async (req, res) => {
        const result =
            await movementService.find(
                {
                    page:
                        Number(
                            req.query.page
                        ) || 1,

                    limit:
                        Number(
                            req.query.limit
                        ) || 100,

                    paginate:
                        req.query
                            .paginate !==
                        "false",

                    productId:
                        req.query
                            .productId,

                    movementType:
                        req.query
                            .movementType,
                }
            );

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
                    currentPage:
                        page,
                    totalPages:
                        Math.ceil(
                            totalItems /
                            limit
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
    });

export const findMovementById = asyncHandler(
    async (req, res) => {
        const movement =
            await movementService.findById(
                req.params.id
            );

        return successResponse(res, {
            data: movement
        })
    }
);
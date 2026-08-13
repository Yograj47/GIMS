import asyncHandler from "express-async-handler";
import * as activityLogService from "./activity-log.service.js";
import { successResponse } from "../../shared/utils/response.js"

export const findActivityLogs =
    asyncHandler(async (req, res) => {
        const result =
            await activityLogService.find({
                page:
                    Number(
                        req.query.page
                    ) || 1,

                limit:
                    Number(
                        req.query.limit
                    ) || 20,

                search:
                    req.query.search ||
                    "",

                type:
                    req.query.type,

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

        return successResponse(
            res,
            {
                data: items,

                meta:
                    paginate
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
            }
        );
    });

export const findActivityLogById =
    asyncHandler(async (req, res) => {
        const activityLog =
            await activityLogService.findById(
                req.params.id
            );

        return successResponse(
            res,
            {
                data: activityLog,
            }
        );
    });
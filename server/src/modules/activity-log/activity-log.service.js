import {
    findActivityLogById,
    findActivityLogs,
    countActivityLogs,
    createActivityLog,
} from "./activity-log.repository.js";

import { AppError } from "../../shared/errors/index.js";

export const create = async (
    payload
) => {
    return createActivityLog(
        payload
    );
};

export const find = async ({
    page = 1,
    limit = 20,
    search = "",
    type,
    paginate = true,
}) => {
    const query = {};

    if (search) {
        query.message = {
            $regex: search,
            $options: "i",
        };
    }

    if (type) {
        query.type = {
            $in: type.split(","),
        };
    }

    const [
        items,
        totalItems,
    ] = await Promise.all([
        findActivityLogs(
            query,
            {
                page,
                limit,
                paginate,
            }
        ),

        countActivityLogs(
            query
        ),
    ]);

    return {
        items,
        totalItems,
        page,
        limit,
        paginate,
    };
};

export const findById =
    async (id) => {
        const activityLog =
            await findActivityLogById(
                id
            );

        if (!activityLog) {
            throw AppError.notFound(
                "Activity log not found"
            );
        }

        return activityLog;
    };
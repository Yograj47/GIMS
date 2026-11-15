import { z } from "zod";
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
    startDate,
    endDate,
    type,
    paginate = true,
}) => {
    const query = {};

    const term = z.string().trim().max(200).parse(search);
    if (term) {
        const pattern = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const match = { $regex: pattern, $options: "i" };
        query.$or = [{ message: match }, { action: match }, { actorRole: match }, { sourceIp: match }, { requestId: match }];
    }
    const date = z.iso.date().or(z.literal("")).optional();
    const start = date.parse(startDate);
    const end = date.parse(endDate);
    if (start || end) {
        query.createdAt = {};
        if (start) query.createdAt.$gte = new Date(start);
        if (end) query.createdAt.$lte = new Date(end + "T23:59:59.999Z");
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

import ActivityLog from "./activity-log.model.js";

export const createActivityLog = (
    payload
) =>
    ActivityLog.create(payload);

export const findActivityLogById = (
    id
) =>
    ActivityLog.findById(id)
        .populate(
            "performedBy",
            "name email role"
        );

export const countActivityLogs = (
    query = {}
) =>
    ActivityLog.countDocuments(query);

export const findActivityLogs = (
    query = {},
    {
        page = 1,
        limit = 20,
        paginate = true,
    } = {}
) => {
    let logs = ActivityLog.find(query)
        .populate(
            "performedBy",
            "name role"
        )
        .sort({
            createdAt: -1,
        });

    if (paginate) {
        logs = logs
            .skip(
                (page - 1) * limit
            )
            .limit(limit);
    }

    return logs.lean();
};
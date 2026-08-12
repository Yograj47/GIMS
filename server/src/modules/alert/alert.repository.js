import Alert from "./alert.model.js";

export const findActiveAlerts =
    () =>
        Alert.find({
            resolved: false,
        })
            .populate(
                "productId",
                "name quantity threshold unit"
            )
            .sort({
                createdAt: -1,
            });

export const countAlerts = () =>
    Alert.countDocuments({
        resolved: false,
    });

export const findById = (id) =>
    Alert.findById(id);

export const findOne = (filter) =>
    Alert.findOne(filter);

export const acknowledgeAlert = (
    alertId,
    userId
) =>
    Alert.findByIdAndUpdate(
        alertId,
        {
            acknowledged:
                true,

            acknowledgedAt:
                new Date(),

            acknowledgedBy:
                userId,
        },
        {
            new: true,
        }
    );

export const resolveAlerts = (
    filter
) =>
    Alert.updateMany(
        filter,
        {
            resolved:
                true,

            resolvedAt:
                new Date(),

            acknowledged:
                false,
        }
    );

export const upsertAlert = (
    filter,
    payload
) =>
    Alert.findOneAndUpdate(
        filter,
        {
            $set: payload,
        },
        {
            new: true,
            upsert: true,
        }
    );

export const findAlerts = (
    filter = {}
) =>
    Alert.find(filter).lean();

export const findAllAlerts =
    (
        page,
        limit
    ) =>
        Alert.find({
            resolved: false,
        })
            .populate({
                path: "productId",
                select:
                    "name quantity unitId threshold",
                populate: {
                    path: "unitId",
                    select: "name",
                },
            })
            .sort({
                createdAt: -1,
            })
            .skip(
                (page - 1) *
                limit
            )
            .limit(limit)
            .lean();
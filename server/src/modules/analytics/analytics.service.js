import Product from "../product/product.model.js";
import Movement from "../movement/movement.model.js";

export const getDashboardSummary =
    async () => {
        const stockValueData =
            await Product.aggregate([
                {
                    $lookup: {
                        from: "units",
                        localField:
                            "unitId",
                        foreignField:
                            "_id",
                        as: "unitDoc",
                    },
                },

                {
                    $unwind:
                        "$unitDoc",
                },

                {
                    $group: {
                        _id: null,

                        totalValue:
                        {
                            $sum: {
                                $multiply:
                                    [
                                        "$quantity",

                                        {
                                            $divide:
                                                [
                                                    "$sellingPrice",

                                                    "$unitDoc.multiplierToBase",
                                                ],
                                        },
                                    ],
                            },
                        },
                    },
                },
            ]);

        const lowItems =
            await Product.countDocuments(
                {
                    $expr: {
                        $lte: [
                            "$quantity",
                            "$threshold",
                        ],
                    },
                }
            );

        const today =
            new Date();

        const todayStart =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );

        const yesterdayStart =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate() -
                1
            );

        const flowStats =
            await Movement.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: yesterdayStart,
                        },

                        movementType:
                            "OUT",
                    },
                },

                {
                    $group: {
                        _id: {
                            $dateToString:
                            {
                                format:
                                    "%Y-%m-%d",

                                date: "$createdAt",
                            },
                        },

                        totalQty:
                        {
                            $sum: "$quantity",
                        },
                    },
                },
            ]);

        const todayStr =
            todayStart
                .toISOString()
                .split("T")[0];

        const yesterdayStr =
            yesterdayStart
                .toISOString()
                .split("T")[0];

        const todayFlow =
            flowStats.find(
                (item) =>
                    item._id ===
                    todayStr
            )?.totalQty || 0;

        const yesterdayFlow =
            flowStats.find(
                (item) =>
                    item._id ===
                    yesterdayStr
            )?.totalQty || 0;

        let trend = 0;

        if (
            yesterdayFlow > 0
        ) {
            trend =
                ((todayFlow -
                    yesterdayFlow) /
                    yesterdayFlow) *
                100;
        }

        return {
            stockValue:
                stockValueData[0]
                    ?.totalValue ||
                0,

            lowItems,

            todayFlow: {
                value:
                    todayFlow,

                trend:
                    Number(
                        trend.toFixed(
                            1
                        )
                    ),

                status:
                    trend >= 0
                        ? "UP"
                        : "DOWN",
            },
        };
    };

export const getWeeklyMovementStats =
    async () => {
        const sevenDaysAgo =
            new Date();

        sevenDaysAgo.setDate(
            sevenDaysAgo.getDate() -
            7
        );

        return Movement.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: sevenDaysAgo,
                    },
                },
            },

            {
                $group: {
                    _id: {
                        day: {
                            $dateToString:
                            {
                                format:
                                    "%Y-%m-%d",

                                date: "$createdAt",
                            },
                        },

                        type: "$movementType",
                    },

                    totalQty: {
                        $sum: "$quantity",
                    },
                },
            },

            {
                $sort: {
                    "_id.day": 1,
                },
            },
        ]);
    };
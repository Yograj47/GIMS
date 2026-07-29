import Product from "../models/Product.Model.js"
import Movement from "../models/Movement.Model.js"
import asyncHandler from "express-async-handler";
import moment from "moment";

/**
 * @desc Get Top Summary Stats for Dashboard Cards
 * @route GET /api/v1/analytics/summary
 */
export const getDashboardSummary = asyncHandler(async (req, res) => {
    // 1. Stock Value: 
    const stockValueData = await Product.aggregate([
        {
            $lookup: {
                from: "units",
                localField: "unitId",
                foreignField: "_id",
                as: "unitDoc"
            }
        },
        { $unwind: "$unitDoc" },
        {
            $group: {
                _id: null,
                totalValue: {
                    $sum: {
                        $multiply: [
                            "$quantity",
                            // price per base unit (KG)
                            { $divide: ["$sellingPrice", "$unitDoc.multiplierToBase"] }
                        ]
                    }
                }
            }
        }
    ]);

    // 2. Low Items: Count items where quantity <= threshold
    const lowItemsCount = await Product.countDocuments({
        $expr: { $lte: ["$quantity", "$threshold"] }
    });

    // 3. Today's Flow: Total OUT movements today vs Yesterday (for the trend)
    const todayStart = moment().startOf('day').toDate();
    const yesterdayStart = moment().subtract(1, 'days').startOf('day').toDate();

    const flowStats = await Movement.aggregate([
        {
            $match: { createdAt: { $gte: yesterdayStart }, movementType: 'OUT' }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                totalQty: { $sum: "$quantity" }
            }
        }
    ]);

    // Extracting today and yesterday from the result array
    const todayStr = moment().format("YYYY-MM-DD");
    const yesterdayStr = moment().subtract(1, 'days').format("YYYY-MM-DD");

    const todayFlow = flowStats.find(f => f._id === todayStr)?.totalQty || 0;
    const yesterdayFlow = flowStats.find(f => f._id === yesterdayStr)?.totalQty || 0;

    // Calculate Trend %
    let trend = 0;
    if (yesterdayFlow > 0) {
        trend = ((todayFlow - yesterdayFlow) / yesterdayFlow) * 100;
    }

    res.status(200).json({
        status: "Success",
        data: {
            stockValue: stockValueData[0]?.totalValue || 0,
            lowItems: lowItemsCount,
            todayFlow: {
                value: todayFlow,
                trend: trend.toFixed(1),
                status: trend >= 0 ? 'UP' : 'DOWN'
            }
        }
    });
});

/**
 * @desc Get aggregated IN/OUT data for 
 * @route GET /api/v1/analytics/weekly-movements
 */
export const getWeeklyMovementStats = asyncHandler(async (req, res) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const stats = await Movement.aggregate([
        {
            $match: {
                createdAt: { $gte: sevenDaysAgo }
            }
        },
        {
            $group: {
                _id: {
                    // Formats date to YYYY-MM-DD for easy mapping
                    day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    type: "$movementType" // 'IN' or 'OUT'
                },
                totalQty: { $sum: "$quantity" }
            }
        },
        { $sort: { "_id.day": 1 } }
    ]);

    res.status(200).json({
        status: "Success",
        data: stats
    });
});
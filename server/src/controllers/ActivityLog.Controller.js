import ActivityLog from "../models/ActivityLog.Model.js";
import asyncHandler from "express-async-handler";

/**
 * @desc    Get all activity logs with standardized pagination & search
 * @route   GET /api/v1/activity-logs
 * @access  Private/Admin
 */
export const getActivityLogs = asyncHandler(async (req, res) => {
    // 1. Sanitize and Parse Inputs
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { search = '', type, startDate, endDate, paginate } = req.query;
    const shouldPaginate = paginate !== 'false';

    const pipeline = [
        {
            $lookup: {
                from: "users",
                localField: "performedBy", 
                foreignField: "_id",
                as: "userDoc"
            }
        },
        { $unwind: "$userDoc" }
    ];

    // Search Logic
    if (search) {
        pipeline.push({
            $match: {
                $or: [
                    { message: { $regex: search, $options: 'i' } },
                    { 'userDoc.name': { $regex: search, $options: 'i' } },
                    { action: { $regex: search, $options: 'i' } },
                ]
            }
        });
    }

    // Type Logic 
    if (type) {
        const typeArray = type.split(',');
        pipeline.push({
            $match: { type: { $in: typeArray } }
        });
    }

    // Date Range Logic 
    if (startDate || endDate) {
        const dateQuery = {};
        if (startDate) dateQuery.$gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
        if (endDate) dateQuery.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
        
        pipeline.push({
            $match: { createdAt: dateQuery }
        });
    }

    pipeline.push({ $sort: { createdAt: -1 } });

    // Project fields
    pipeline.push({
        $project: {
            _id: 1,
            performedBy: { name: "$userDoc.name", role: "$userDoc.role" },
            action: 1,
            type: 1,
            message: 1,
            createdAt: 1
        }
    });

    let totalItems = 0;
    if (shouldPaginate) {
        const countResult = await ActivityLog.aggregate([...pipeline, { $count: "total" }]);
        totalItems = countResult[0]?.total || 0;

        // Ensure these are Numbers
        pipeline.push({ $skip: (page - 1) * limit });
        pipeline.push({ $limit: limit });
    }

    const results = await ActivityLog.aggregate(pipeline);

    res.status(200).json({
        status: "Success",
        data: results, 
        meta: {
            totalItems,
            ...(shouldPaginate && {
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
                itemsPerPage: limit
            })
        }
    });
});
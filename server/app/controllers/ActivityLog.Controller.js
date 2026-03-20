import ActivityLog from "../models/ActivityLog.Model.js";
import asyncHandler from "express-async-handler";

/**
 * @desc    Get all activity logs with standardized pagination & search
 * @route   GET /api/v1/activity-logs
 * @access  Private/Admin
 */
export const getActivityLogs = asyncHandler(async (req, res) => {
    const { page, limit, search = '', type, startDate, endDate, paginate } = req.query;
    const shouldPaginate = paginate !== 'false';

    // 1. Build Query Object
    const query = {};

    // Search Logic
    if (search) {
        query.$or = [
            { message: { $regex: search, $options: 'i' } },
            { action: { $regex: search, $options: 'i' } },
        ];
    }

    // Type Logic (Supports single or multiple types)
    if (type) {
        const typeArray = type.split(',');
        query.type = { $in: typeArray };
    }

    // Date Range Logic
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
        if (endDate) query.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    // 2. Execute Query
    let itemsQuery = ActivityLog.find(query)
        .populate("performedBy", "name role") 
        .sort({ createdAt: -1 })
        .lean(); 

    if (shouldPaginate) {
        itemsQuery = itemsQuery.skip((parseInt(page) - 1) * parseInt(limit)).limit(parseInt(limit));
    }

    const [items, totalItems] = await Promise.all([
        itemsQuery,
        ActivityLog.countDocuments(query)
    ]);

    res.status(200).json({
        status: "Success",
        data: items,
        meta: {
            totalItems,
            ...(shouldPaginate && {
                totalPages: Math.ceil(totalItems / limit),
                currentPage: parseInt(page)
            })
        }
    });
});
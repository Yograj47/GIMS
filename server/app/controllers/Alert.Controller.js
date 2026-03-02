import Alert from "../models/Alert.Model.js";
import asyncHandler from "express-async-handler";

/**
 * @desc Get all active/unresolved alerts (For Dashboard & Sidebar Badge)
 * @route GET /api/v1/alerts/active
 */
export const getActiveAlerts = asyncHandler(async (req, res) => {
    const alerts = await Alert.find({ resolved: false })
        .populate("productId", "name quantity threshold")
        .sort({ createdAt: -1 });

    res.status(200).json({
        status: "Success",
        data: alerts,
        meta: {
            totalItems: alerts.length,
            paginationDisabled: true
        }
    });
});

/**
 * @desc Get all alerts with standardized pagination
 * @route GET /api/v1/alerts
 */
export const getAllAlerts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const shouldPaginate = req.query.paginate !== 'false';


    // Use Promise.all for faster execution
    const [items, totalItems] = await Promise.all([
        Alert.find()
            .populate("productId", "name quantity unit threshold")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select('-__v'),
        Alert.countDocuments()
    ]);

    res.status(200).json({
        status: "Success",
        data: items,
        meta: shouldPaginate ? {
            totalItems,
            itemsPerPage: items.length,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
        } : {
            totalItems,
            itemsPerPage: items.length,
            paginationDisabled: true
        }
    });
});

/**
 * @desc Manually resolve an alert
 */
export const resolveAlert = asyncHandler(async (req, res) => {
    const alert = await Alert.findByIdAndUpdate(
        req.params.id,
        {
            resolved: true,
            resolvedAt: new Date()
        },
        { new: true }
    );

    if (!alert) {
        res.status(404);
        throw new Error("Alert not found");
    }

    res.status(200).json({
        status: "Success",
        message: "Alert marked as resolved",
        data: alert
    });
});
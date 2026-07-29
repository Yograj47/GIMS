import Alert from "../models/Alert.Model.js";
import asyncHandler from "express-async-handler";

/**
 * @desc Get all active/unresolved alerts (For Dashboard & Sidebar Badge)
 * @route GET /api/v1/alerts/active
 */
export const getActiveAlerts = asyncHandler(async (req, res) => {
    const alerts = await Alert.find({ resolved: false })
        .populate("productId", "name quantity threshold unit")
        .sort({ createdAt: -1 });

    const formattedAlerts = alerts.map(alert => {
        const doc = alert.toObject();
        return {
            ...doc,
            severity: doc.severity || (doc.productId?.quantity === 0 ? "critical" : "warning"),
            snapshotValue: doc.snapshotValue || doc.productId?.quantity || 0
        };
    });

    res.status(200).json({
        status: "Success",
        data: formattedAlerts,
        meta: {
            totalItems: formattedAlerts.length,
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

    const [items, totalItems] = await Promise.all([
        Alert.find({ resolved: false })
            .populate({ path: "productId", select: "name quantity unitId threshold", populate: { path: "unitId", select: "name" } })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Alert.countDocuments({ resolved: false })
    ]);

    const formattedItems = items.map(alert => ({
        ...alert,
        severity: alert.severity || (alert.productId?.quantity === 0 ? "critical" : "warning"),

        snapshotValue: alert.snapshotValue || alert.productId?.quantity || 0,

        type: alert.type || "low-stock"
    }));

    res.status(200).json({
        status: "Success",
        data: formattedItems,
        meta: shouldPaginate ? {
            totalItems,
            itemsPerPage: formattedItems.length,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
        } : {
            totalItems,
            itemsPerPage: formattedItems.length,
            paginationDisabled: true
        }
    });
});

/**
 * @desc Acknowledge the alert
 */
export const acknowledgeAlert = asyncHandler(async (req, res) => {
    const alert = await Alert.findByIdAndUpdate(
        req.params.id,
        {
            acknowledged: true,
            acknowledgedAt: new Date(),
            acknowledgedBy: req.user._id
        },
        { new: true }
    );

    if (!alert) {
        res.status(404);
        throw new Error("Alert not found");
    }

    res.status(200).json({
        status: "Success",
        message: "Alert acknowledged",
        data: alert
    });
});
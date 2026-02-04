import asyncHandler from "express-async-handler";
import { activityLogSchema } from "../validation/ActivityLog.validation.js"
import ActivityLog from "../models/ActivityLog.Model.js"

/**
 * @desc    Create Activity Log (System/Internal Use)
 * @route   POST /api/v1/activity-logs
 * @access  Private
 */
export const createActivityLog = asyncHandler(async (req, res) => {
    const validatedData = activityLogSchema.parse(req.body);

    const log = await ActivityLog.create(validatedData);

    res.status(201).json({
        status: "success",
        data: log
    });
});


/**
 * @desc    Get All Activity Logs
 * @route   GET /api/v1/activity-logs
 * @access  Private (Admin / Owner recommended)
 */
export const getActivityLogs = asyncHandler(async (req, res) => {

    const logs = await ActivityLog
        .find()
        .populate("performedBy", "name email role")
        .sort({ timestamp: -1 })
        .select("-__v");

    res.status(200).json({
        status: "success",
        results: logs.length,
        data: logs
    });
});

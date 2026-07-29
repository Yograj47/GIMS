import ActivityLog from "../models/ActivityLog.Model.js";

/**
 * Internal helper to create logs throughout the app
 * @param {string} userId - ID of user performing action
 * @param {string} action - e.g., 'CREATE_PRODUCT', 'SALE_COMPLETED'
 * @param {string} type - e.g., 'Inventory', 'Finance', 'Security'
 * @param {string} message - Human readable description
 */
export const createLog = async (userId, action, type, message) => {
    try {
        await ActivityLog.create({
            performedBy: userId,
            action,
            type,
            message
        });
    } catch (error) {
        console.error("Failed to save activity log:", error);
    }
};
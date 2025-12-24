import asyncHandler from "express-async-handler";
import User from "../models/User.Model.js";

// @desc Get Me
/** 
* @route GET /api/v1/users/profile
* @access Private
* @param {string} userId - User ID from request body
* @returns {object} 200 - User profile data
*/
export const getMe = asyncHandler(async (req, res) => {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    res.status(200).json({
        success: true, data: {
            name: user.name,
            isVerfied: user.isVerfied,
        }
    });
})
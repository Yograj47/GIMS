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
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    console.log(user);
    

    res.status(200).json({
        status: "Success",
        data: {
            name: user.name,
            role: user.role,
            password: user.password,
            email: user.email,
            isVerfied: user.isVerfied
        }
    });
})


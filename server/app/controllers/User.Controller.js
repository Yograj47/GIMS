import asyncHandler from "express-async-handler";
import User from "../models/User.Model.js";
import bcrypt from "bcryptjs";

/** 
 * @desc Get Me
*/
export const getMe = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }


    res.status(200).json({
        status: "Success",
        data: {
            name: user.name,
            role: user.role,
            password: user.password,
            email: user.email,
            isVerified: user.isVerified
        }
    });
})

/**
 * @desc Get all users (Admin only)
 */

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find()
        .select("-password -verifyOptExpiryAt -resetOptExpiryAt -verifyOpt -resetOpt");

    res.status(200).json({
        status: "Success",
        data: users
    });
});

/**
 * @desc Update user details (name, email) - accessible to all authenticated users
 */
export const updateUserDetails = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
        userId,
        { name, email },
        { new: true, runValidators: true }
    ).select("-password -verifyOptExpiryAt -resetOptExpiryAt -verifyOpt -resetOpt");

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    res.status(200).json({
        status: "Success",
        data: user
    });
});

/**
 * @desc Update user password - accessible to all authenticated users
 */
export const UpdatePassword = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password) 

    if (!isMatch) {
        res.status(400);
        throw new Error("Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();  

    res.status(200).json({
        status: "Success",
        message: "Password updated successfully"
    });
});


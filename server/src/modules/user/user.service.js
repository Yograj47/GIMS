import bcrypt from "bcryptjs";
import User from "./user.model.js";

import {
    findUserById,
    findUserByEmail,
    updateUserById,
} from "./user.repository.js";
import { AppError } from "../../shared/errors/index.js"

export const findMe = async (userId) => {
    const user = await findUserById(userId);

    if (!user) {
        throw AppError.notFound("User not found");
    }

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
    };
};

export const findAllUsers = async () => {
    return User.find().select(
        "-password -verifyOtp -verifyOtpExpiresAt -resetOtp -resetOtpExpiresAt"
    );
};

export const updateProfile = async (
    userId,
    payload
) => {
    const user = await updateUserById(
        userId,
        payload
    );

    if (!user) {
        throw AppError.notFound("User not found");
    }

    return user;
};

export const updatePassword = async ({
    userId,
    currentPassword,
    newPassword,
}) => {
    const user = await findUserById(userId);

    if (!user) {
        throw AppError.notFound("User not found");
    }

    const isMatch = await bcrypt.compare(
        currentPassword,
        user.password
    );

    if (!isMatch) {
        throw AppError.badRequest(
            "Current password is incorrect"
        );
    }

    user.password = await bcrypt.hash(
        newPassword,
        10
    );

    await user.save();

    return true;
};
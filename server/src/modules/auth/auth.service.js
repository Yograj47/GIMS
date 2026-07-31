import bcrypt from "bcryptjs";

import {
    findUserByEmail,
    findUserById,
    createUser,
    updateUserById,
    deleteUserById,
} from "../user/user.repository.js";

import {
    ROLES,
    OTP_EXPIRY_MINUTES,
} from "../../shared/constants/index.js";

import {
    generateToken,
    sendEmail,
    createEmailTemplate
} from "../../shared/services/index.js";
import { AppError } from "../../shared/errors/index.js";

export const registerUser = async ({
    name,
    email,
    password,
}) => {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
        throw AppError.conflict("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
        name,
        email,
        password: hashedPassword,
    });

    const token = generateToken(user);

    return {
        user,
        token,
    };
};

export const loginUser = async ({
    email,
    password,
}) => {
    const user = await findUserByEmail(email);

    if (!user) {
        throw AppError.unauthorized("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {
        throw AppError.unauthorized("Invalid credentials");
    }

    const token = generateToken(user);

    return {
        user,
        token,
    };
};

export const sendVerifyOtp = async (userId) => {
    const user = await findUserById(userId);

    if (!user) {
        throw AppError.notFound("User not found");
    }

    if (user.isVerified) {
        throw AppError.badRequest("User is already verified");
    }

    const otp = generateOtp();

    await updateUserById(userId, {
        verifyOtp: otp,
        verifyOtpExpiresAt:
            Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
    });

    const html = createEmailTemplate(
        "Verify Your Email",
        `
        <p>Your verification code is below.</p>
        <h1 style="text-align:center">
            ${otp}
        </h1>
        `
    );

    await sendEmail(
        user.email,
        "Account Verification OTP",
        html
    );

    return true;
};

export const verifyEmail = async ({
    userId,
    otp,
}) => {
    const user = await findUserById(userId);

    if (!user) {
        throw AppError.notFound("User not found");
    }

    const isOtpInvalid =
        !user.verifyOtp ||
        user.verifyOtp !== String(otp) ||
        Date.now() > user.verifyOtpExpiresAt;

    if (isOtpInvalid) {
        throw AppError.badRequest("Invalid or expired OTP");
    }

    const updatedUser = await updateUserById(userId, {
        isVerified: true,
        verifyOtp: null,
        verifyOtpExpiresAt: 0,
    });

    return updatedUser;
};

export const resetPasswordOtp = async (email) => {
    const user = await findUserByEmail(email);

    if (!user) {
        throw AppError.notFound("User not found");
    }

    const otp = generateOtp();

    await updateUserById(user._id, {
        resetOtp: otp,
        resetOtpExpiresAt:
            Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
    });

    const html = createEmailTemplate(
        "Password Reset Request",
        `
        <p>We received a request to reset your password.</p>

        <div style="background:#f1f5f9;padding:20px;text-align:center">
            <span style="font-size:32px;font-weight:bold;">
                ${otp}
            </span>
        </div>

        <p>This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
        `,
        "Reset Password",
        `${process.env.CLIENT_URL}/reset-password`
    );

    await sendEmail(
        user.email,
        "Password Reset OTP 🔐",
        html
    );

    return true;
};

export const resetPassword = async ({
    email,
    otp,
    newPassword,
}) => {
    const user = await findUserByEmail(email);

    if (!user) {
        throw AppError.notFound("User not found");
    }

    const isOtpInvalid =
        !user.resetOtp ||
        user.resetOtp !== String(otp) ||
        Date.now() > user.resetOtpExpiresAt;

    if (isOtpInvalid) {
        throw AppError.badRequest("Invalid or expired OTP");
    }

    const hashedPassword = await bcrypt.hash(
        newPassword,
        10
    );

    return updateUserById(user._id, {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpiresAt: 0,
    });
};

export const updateRole = async ({
    currentUserId,
    targetUserId,
    role,
}) => {
    const validRoles = Object.values(ROLES);

    if (!validRoles.includes(role)) {

        throw AppError.badRequest(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
    }

    if (currentUserId.toString() === targetUserId.toString()) {
        throw AppError.badRequest("You cannot change your own role");
    }

    const user = await updateUserById(
        targetUserId,
        { role }
    );

    if (!user) {
        throw AppError.notFound("User not found");

    }

    return user;
};

export const removeUser = async ({
    currentUserId,
    targetUserId,
}) => {
    if (currentUserId.toString() === targetUserId.toString()) {
        throw AppError.badRequest("You cannot delete your own account");
    }

    const user = await deleteUserById(
        targetUserId
    );

    if (!user) {
        throw AppError.notFound("User not found");
    }

    return user;
};

const generateOtp = () =>
    Math.floor(100000 + Math.random() * 900000).toString();
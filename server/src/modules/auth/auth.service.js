import bcrypt from "bcryptjs";

import {
    findUserByEmail,
    findUserById,
    createUser,
    updateUserById,
    deleteUserById,
} from "../user/user.service.js";

import {
    ROLES,
    OTP_EXPIRY_MINUTES,
} from "../../shared/constants/index.js";

import {
    generateToken,
    sendEmail,
} from "../../shared/services/index.js";

export const registerUser = async ({
    name,
    email,
    password,
}) => {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
        const error = new Error("User already exists");
        error.statusCode = 409;
        throw error;
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
        const error = new Error("Invalid credentials");
        error.statusCode = 401;
        throw error;
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {
        const error = new Error("Invalid credentials");
        error.statusCode = 401;
        throw error;
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
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    if (user.isVerified) {
        const error = new Error("User is already verified");
        error.statusCode = 400;
        throw error;
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
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const isOtpInvalid =
        !user.verifyOtp ||
        user.verifyOtp !== String(otp) ||
        Date.now() > user.verifyOtpExpiresAt;

    if (isOtpInvalid) {
        const error = new Error("Invalid or expired OTP");
        error.statusCode = 400;
        throw error;
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
        throwError("User not found", 404);
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
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const isOtpInvalid =
        !user.resetOtp ||
        user.resetOtp !== String(otp) ||
        Date.now() > user.resetOtpExpiresAt;

    if (isOtpInvalid) {
        const error = new Error("Invalid or expired OTP");
        error.statusCode = 400;
        throw error;
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
        const error = new Error(
            `Invalid role. Must be one of: ${validRoles.join(", ")}`
        );
        error.statusCode = 400;
        throw error;
    }

    if (currentUserId.toString() === targetUserId.toString()) {
        const error = new Error(
            "You cannot change your own role"
        );
        error.statusCode = 400;
        throw error;
    }

    const user = await updateUserById(
        targetUserId,
        { role }
    );

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return user;
};

export const removeUser = async ({
    currentUserId,
    targetUserId,
}) => {
    if (currentUserId.toString() === targetUserId.toString()) {
        const error = new Error(
            "You cannot delete your own account"
        );
        error.statusCode = 400;
        throw error;
    }

    const user = await deleteUserById(
        targetUserId
    );

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return user;
};

const generateOtp = () =>
    Math.floor(100000 + Math.random() * 900000).toString();
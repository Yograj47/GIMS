import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import { CustomerAccount } from "../user/customer.model.js";
import { registerCustomer } from "../user/customer.service.js";
import { consumeOtp, otpDigest } from "./otp.service.js";
import { disconnectAccountSessions } from "../../shared/socket/emitter.js";

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

const createAccount = async ({
    name,
    email,
    password,
}, role) => {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
        throw AppError.conflict("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return createUser({
        name,
        email,
        password: hashedPassword,
        role,
    });
};

export const createStaffAccount = (payload) => createAccount(payload, ROLES.STAFF);

export const registerUser = async (payload) => {
    const user = await registerCustomer(payload);
    const token = generateToken(user);

    return {
        user,
        token,
    };
};

export const loginUser = async ({
    email,
    password,
}, { customer = false } = {}) => {
    const user = customer ? await CustomerAccount.findOne({ email }) : await findUserByEmail(email);

    if (!user) {
        throw AppError.unauthorized("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid || (user.role === ROLES.CUSTOMER) !== customer) {
        throw AppError.unauthorized("Invalid credentials");
    }

    const token = generateToken(user);

    return {
        user,
        token,
    };
};

const findAccount = (id, role) => role === ROLES.CUSTOMER ? CustomerAccount.findById(id) : findUserById(id);

export async function logoutSession({ id, role }) {
    const account = await findAccount(id, role);
    if (account) await account.updateOne({ $inc: { tokenVersion: 1 } });
    disconnectAccountSessions(id);
}

export const sendVerifyOtp = async (userId, role) => {
    const user = await findAccount(userId, role);
    if (!user) {
        throw AppError.notFound("User not found");
    }

    if (user.isVerified) {
        throw AppError.badRequest("User is already verified");
    }

    const otp = generateOtp();

    await user.updateOne({
        verifyOtp: otpDigest(otp),
        verifyOtpAttempts: 0,
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
    role,
}) => {
    const user = await findAccount(userId, role);

    if (!user) {
        throw AppError.notFound("User not found");
    }

    return consumeOtp(user, "verify", otp, { isVerified: true });
};

export const resetPasswordOtp = async (email, customer) => {
    const user = customer ? await CustomerAccount.findOne({ email }) : await findUserByEmail(email);

    if (!user) {
        return true;
    }

    const otp = generateOtp();

    await user.updateOne({
        resetOtp: otpDigest(otp),
        resetOtpAttempts: 0,
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
        `${process.env.CLIENT_URL}${customer ? "/shop" : ""}/forget-password`
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
}, customer) => {
    const user = customer ? await CustomerAccount.findOne({ email }) : await findUserByEmail(email);

    if (!user) {
        throw AppError.notFound("User not found");
    }

    const hashedPassword = await bcrypt.hash(
        newPassword,
        10
    );

    const updated = await consumeOtp(user, "reset", otp, { password: hashedPassword });
    disconnectAccountSessions(user.id);
    return updated;
};

export const updateRole = async ({
    currentUserId,
    targetUserId,
    role,
}) => {
    const validRoles = Object.values(ROLES).filter((value) => value !== ROLES.CUSTOMER);

    if (!validRoles.includes(role)) {

        throw AppError.badRequest(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
    }

    if (currentUserId.toString() === targetUserId.toString()) {
        throw AppError.badRequest("You cannot change your own role");
    }

    const user = await updateUserById(targetUserId, { $set: { role }, $inc: { tokenVersion: 1 } });

    if (!user) {
        throw AppError.notFound("User not found");

    }

    disconnectAccountSessions(user.id);
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

    disconnectAccountSessions(user.id);
    return user;
};

const generateOtp = () => randomInt(100000, 1000000).toString();

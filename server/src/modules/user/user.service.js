import bcrypt from "bcryptjs";
import User from "./user.model.js";
import { Customer, CustomerAccount } from "./customer.model.js";
import { updateCustomerProfile } from "./customer.service.js";

import {
    findUserById,
    updateUserById,
} from "./user.repository.js";
import { AppError } from "../../shared/errors/index.js"

export const findMe = async ({ id: userId, role }) => {
    if (role === "customer") {
        const account = await CustomerAccount.findById(userId);
        const customer = account && await Customer.findById(account.customerId);
        if (!customer) throw AppError.notFound("Customer not found");
        return {
            id: account.id, role, name: customer.name, email: account.email, isVerified: account.isVerified,
            phone: customer.phone, deliveryAddress: customer.deliveryAddress?.province ? customer.deliveryAddress : null,
        };
    }
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
    return User.find({ role: { $ne: "customer" } }).select(
        "-password -verifyOtp -verifyOtpExpiresAt -resetOtp -resetOtpExpiresAt -phone -deliveryAddress"
    );
};

export const updateProfile = async (
    { id: userId, role },
    payload
) => {
    if (role === "customer") return updateCustomerProfile(userId, payload);
    if (payload.phone !== undefined || payload.deliveryAddress !== undefined) {
        throw AppError.forbidden("Delivery contact details are for customer accounts");
    }

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
    role,
    currentPassword,
    newPassword,
}) => {
    const user = role === "customer" ? await CustomerAccount.findById(userId) : await findUserById(userId);

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

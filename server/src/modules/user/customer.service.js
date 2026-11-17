import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import mongoose from "mongoose";
import { AppError } from "../../shared/errors/index.js";
import { validContactPhone } from "../../shared/utils/deliveryContact.js";
import { Customer, CustomerAccount } from "./customer.model.js";

export function normalizeCustomerPhone(phone) {
    if (!validContactPhone(phone)) return null;
    const compact = phone.replace(/[\s().-]/g, "");
    return /^\+?\d{7,15}$/.test(compact) ? compact.replace(/^\+?977(?=9\d{9}$)/, "") : null;
}

export function lookupCustomer(phone, session) {
    const normalized = normalizeCustomerPhone(phone);
    if (!normalized) return null;
    const aliases = /^9\d{9}$/.test(normalized)
        ? [normalized, "+977" + normalized, "977" + normalized] : [normalized];
    return Customer.findOne({ phone: { $in: aliases } }).session(session ?? null);
}

export async function findOrCreateCustomer({ name, phone } = {}, session) {
    const normalized = normalizeCustomerPhone(phone);
    if (!name?.trim() || !normalized) return null;
    const existing = await lookupCustomer(normalized, session);
    if (existing) return existing;
    return Customer.findOneAndUpdate({ phone: normalized }, { $setOnInsert: { name: name.trim() } }, {
        upsert: true, returnDocument: "after", session,
    });
}

const hashClaim = (value) => createHash("sha256").update(value).digest("hex");

export async function issueCustomerClaim(customerId) {
    const customer = await Customer.findById(customerId);
    if (!customer?.phone) throw AppError.notFound("Customer with a mobile number not found");
    if (await CustomerAccount.exists({ customerId })) throw AppError.conflict("This customer already has an online account");
    const code = randomBytes(16).toString("base64url");
    const expiresAt = new Date(Date.now() + 15 * 60_000);
    await customer.updateOne({ claimDigest: hashClaim(code), claimExpiresAt: expiresAt });
    return { code, expiresAt };
}

export async function registerCustomer({ name, email, password, phone, claimCode }) {
    const normalized = normalizeCustomerPhone(phone);
    if (!normalized) throw AppError.badRequest("Enter a valid mobile number");
    const hash = await bcrypt.hash(password, 10);
    await Promise.all([Customer.init(), CustomerAccount.init()]);
    try {
        return await mongoose.connection.transaction(async (session) => {
            if (await CustomerAccount.exists({ email }).session(session)) throw AppError.conflict("An account already uses this email");
            let customer = await lookupCustomer(normalized, session);
            const claiming = Boolean(customer);
            if (customer) {
                if (await CustomerAccount.exists({ customerId: customer.id }).session(session)) {
                    throw AppError.conflict("An account already uses this mobile number");
                }
                if (!claimCode) throw AppError.conflict("Ask the store to verify your number and provide an account linking code.");
                customer = await Customer.findOneAndUpdate({
                    _id: customer.id, claimDigest: hashClaim(claimCode), claimExpiresAt: { $gt: new Date() },
                }, { $unset: { claimDigest: "", claimExpiresAt: "" } }, { session, returnDocument: "after" });
                if (!customer) throw AppError.badRequest("Invalid or expired account linking code");
            } else {
                if (claimCode) throw AppError.badRequest("The account linking code does not match this mobile number");
                [customer] = await Customer.create([{ name, phone: normalized }], { session });
            }
            const [account] = await CustomerAccount.create([{
                _id: customer._id, customerId: customer._id, email, password: hash,
                counterHistoryBefore: claiming ? new Date() : undefined,
            }], { session });
            return account;
        });
    } catch (error) {
        if (error.code === 11000) throw AppError.conflict("An account already uses this email or mobile number");
        throw error;
    }
}

export async function updateCustomerProfile(accountId, { name, email, phone, deliveryAddress }) {
    try {
        return await mongoose.connection.transaction(async (session) => {
            const account = await CustomerAccount.findById(accountId).session(session);
            if (!account) throw AppError.notFound("Account not found");
            const customer = await Customer.findById(account.customerId).session(session);
            if (!customer) throw AppError.notFound("Customer not found");
            if (name !== undefined) customer.name = name;
            if (deliveryAddress !== undefined) customer.deliveryAddress = deliveryAddress;
            if (phone !== undefined) {
                const normalized = normalizeCustomerPhone(phone);
                if (phone && !normalized) throw AppError.badRequest("Enter a valid mobile number");
                const existing = await lookupCustomer(normalized, session);
                if (existing && !existing._id.equals(customer._id)) {
                    throw AppError.conflict("This mobile number is already registered");
                }
                customer.phone = normalized;
            }
            if (email && email !== account.email) {
                account.set({ email, isVerified: false, verifyOtp: null, verifyOtpExpiresAt: 0, resetOtp: null, resetOtpExpiresAt: 0 });
                await account.save({ session });
            }
            await customer.save({ session });
            return { _id: account._id, role: account.role, name: customer.name, email: account.email, isVerified: account.isVerified };
        });
    } catch (error) {
        if (error.code === 11000) throw AppError.conflict("An account already uses this email or mobile number");
        throw error;
    }
}

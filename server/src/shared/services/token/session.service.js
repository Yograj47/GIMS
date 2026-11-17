import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../../../modules/user/user.model.js";
import { CustomerAccount } from "../../../modules/user/customer.model.js";
import { AppError } from "../../errors/index.js";

export async function readSession(token) {
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    } catch {
        throw AppError.unauthorized("Your session has expired. Please sign in again.");
    }
    if (!decoded || typeof decoded !== "object" || !mongoose.isObjectIdOrHexString(decoded.id)) {
        throw AppError.unauthorized("Invalid session");
    }
    const model = decoded.role === "customer" ? CustomerAccount : User;
    const account = await model.findById(decoded.id)
        .select("role isVerified customerId counterHistoryBefore name email tokenVersion");
    if (!account || account.role !== decoded.role || (account.tokenVersion ?? 0) !== (decoded.version ?? 0)) {
        throw AppError.unauthorized("Your session has expired. Please sign in again.");
    }
    account.$locals.sessionExpiresAt = decoded.exp ? decoded.exp * 1000 : undefined;
    return account;
}

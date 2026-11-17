import { createHmac } from "node:crypto";
import { AppError } from "../../shared/errors/index.js";

export const otpDigest = (code) => createHmac("sha256", process.env.JWT_SECRET).update(code).digest("hex");

export async function consumeOtp(account, purpose, code, changes) {
    const field = purpose === "verify" ? "verifyOtp" : "resetOtp";
    const attempts = field + "Attempts";
    const expires = field + "ExpiresAt";
    const updated = await account.constructor.findOneAndUpdate({
        _id: account._id,
        email: account.email,
        [field]: { $in: [otpDigest(code), code] },
        [expires]: { $gt: Date.now() },
        $or: [{ [attempts]: { $exists: false } }, { [attempts]: { $lt: 5 } }],
    }, {
        $set: { ...changes, [field]: null, [expires]: 0, [attempts]: 0 },
        ...(purpose === "reset" ? { $inc: { tokenVersion: 1 } } : {}),
    }, { returnDocument: "after" });
    if (updated) return updated;
    await account.constructor.updateOne({
        _id: account._id, [field]: { $ne: null }, [expires]: { $gt: Date.now() },
        $or: [{ [attempts]: { $exists: false } }, { [attempts]: { $lt: 5 } }],
    }, { $inc: { [attempts]: 1 } });
    throw AppError.badRequest("Invalid or expired OTP");
}

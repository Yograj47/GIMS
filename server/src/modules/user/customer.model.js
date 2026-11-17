import mongoose from "mongoose";

const { Schema } = mongoose;
const customerSchema = new Schema({
    name: { type: String, required: true },
    phone: { type: String, default: null },
    deliveryAddress: { province: String, district: String, address: String },
    claimDigest: { type: String, select: false },
    claimExpiresAt: { type: Date, select: false },
}, { timestamps: true, collection: "customercontacts" });
customerSchema.index({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $type: "string" } }, name: "unique_customer_phone" });

const accountSchema = new Schema({
    customerId: { type: Schema.Types.ObjectId, ref: "Customers", required: true, unique: true, immutable: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verifyOtp: String,
    verifyOtpExpiresAt: Number,
    resetOtp: String,
    resetOtpExpiresAt: Number,
    counterHistoryBefore: Date,
}, { timestamps: true });
accountSchema.virtual("role").get(() => "customer");

export const Customer = mongoose.model("Customers", customerSchema);
export const CustomerAccount = mongoose.model("CustomerAccounts", accountSchema);

import mongoose from "mongoose";
import { orderStages } from "./orderLifecycle.js";

const { Schema } = mongoose;
const item = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: "Products", required: true },
    unitId: { type: Schema.Types.ObjectId, ref: "Units", required: true },
    productName: { type: String, required: true },
    unitName: String,
    qty: { type: Number, required: true },
    multiplier: { type: Number, required: true },
    baseQuantity: { type: Number, required: true },
    rateMinor: { type: Number, required: true },
    totalMinor: { type: Number, required: true },
}, { _id: false });

const schema = new Schema({
    accessHash: { type: String, required: true, unique: true, select: false },
    requestHash: { type: String, required: true, select: false },
    channel: { type: String, enum: ["in_store", "online"], required: true },
    fulfillment: { type: String, enum: ["counter", "pickup", "delivery"], required: true },
    paymentMethod: { type: String, enum: ["cash", "gateway"], required: true },
    status: { type: String, enum: ["reserved", "paid", "completed", "cancelled", "payment_review"], required: true },
    expiresAt: Date,
    items: { type: [item], required: true },
    totalMinor: { type: Number, required: true },
    customer: { name: String, phone: String, province: String, district: String, address: String },
    customerId: { type: Schema.Types.ObjectId, ref: "Customers" },
    fulfillmentStatus: { type: String, enum: orderStages },
    timeline: [{
        status: { type: String, required: true },
        at: { type: Date, required: true },
        actorId: { type: Schema.Types.ObjectId, ref() { return this.actorType === "customer" ? "Customers" : "Users"; } },
        actorType: { type: String, enum: ["customer", "staff"] },
        note: String,
    }],
    refundedAt: Date,
    refundReference: String,
    expiryNotifiedAt: Date,
    providerPaymentId: String,
    providerPaymentUrl: String,
    providerTransactionId: String,
    paymentStartedAt: Date,
    paidAt: Date,
    transactionId: { type: Schema.Types.ObjectId, ref: "Transactions" },
}, { timestamps: true });
schema.index({ "items.productId": 1, status: 1, expiresAt: 1 });
schema.index({ customerId: 1, createdAt: -1, _id: -1 });
schema.index({ channel: 1, fulfillmentStatus: 1, createdAt: -1 });
schema.index({ channel: 1, status: 1, expiryNotifiedAt: 1, expiresAt: 1 });
schema.index({ providerPaymentId: 1 }, { unique: true, partialFilterExpression: { providerPaymentId: { $type: "string" } } });
schema.index({ providerTransactionId: 1 }, { unique: true, partialFilterExpression: { providerTransactionId: { $type: "string" } } });

export default mongoose.model("CheckoutOrders", schema);

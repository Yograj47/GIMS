import mongoose from "mongoose";

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
    customer: { name: String, phone: String, address: String },
    providerPaymentId: String,
    providerPaymentUrl: String,
    providerTransactionId: String,
    paymentStartedAt: Date,
    paidAt: Date,
    transactionId: { type: Schema.Types.ObjectId, ref: "Transactions" },
}, { timestamps: true });
schema.index({ "items.productId": 1, status: 1, expiresAt: 1 });
schema.index({ providerPaymentId: 1 }, { unique: true, partialFilterExpression: { providerPaymentId: { $type: "string" } } });
schema.index({ providerTransactionId: 1 }, { unique: true, partialFilterExpression: { providerTransactionId: { $type: "string" } } });

export default mongoose.model("CheckoutOrders", schema);

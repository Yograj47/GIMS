import mongoose from "mongoose";

const { Schema } = mongoose;
const reference = (ref) => ({ type: Schema.Types.ObjectId, ref, required: true });
const quantity = { type: Number, required: true, min: 0 };

const receiptLine = new Schema({
    productId: reference("Products"),
    unitId: reference("Units"),
    multiplier: quantity,
    enteredQuantity: quantity,
    baseQuantity: quantity,
    quarantinedQuantity: quantity,
    unitCost: { type: Schema.Types.Decimal128, required: true },
});

const receiptSchema = new Schema({
    requestKey: { type: String, required: true, unique: true },
    supplierId: reference("Suppliers"),
    supplierName: { type: String, required: true },
    performedBy: reference("Users"),
    deliveryReference: String,
    currency: { type: String, required: true },
    items: { type: [receiptLine], required: true },
}, { timestamps: true });
receiptSchema.index({ supplierId: 1, createdAt: -1 });

const lotSchema = new Schema({
    productId: reference("Products"),
    supplierId: reference("Suppliers"),
    receiptId: reference("GoodsReceipts"),
    receiptLineId: { type: Schema.Types.ObjectId, required: true, unique: true },
    baseUnitId: reference("Units"),
    batchNumber: String,
    expiresOn: String,
    sellableQuantity: quantity,
    quarantinedQuantity: quantity,
}, { timestamps: true });
lotSchema.index({ productId: 1, createdAt: 1, _id: 1 });
lotSchema.index({ supplierId: 1, createdAt: -1 });
lotSchema.index({ expiresOn: 1 });

const returnSchema = new Schema({
    requestKey: { type: String, required: true, unique: true },
    supplierId: reference("Suppliers"),
    lotId: reference("StockLots"),
    receiptId: reference("GoodsReceipts"),
    receiptLineId: { type: Schema.Types.ObjectId, required: true },
    performedBy: reference("Users"),
    bucket: { type: String, enum: ["sellable", "quarantined"], required: true },
    baseQuantity: quantity,
    reason: { type: String, required: true },
}, { timestamps: true });
returnSchema.index({ supplierId: 1, createdAt: -1 });
returnSchema.index({ lotId: 1, createdAt: -1 });

export const GoodsReceipt = mongoose.model("GoodsReceipts", receiptSchema);
export const StockLot = mongoose.model("StockLots", lotSchema);
export const SupplierReturn = mongoose.model("SupplierReturns", returnSchema);

const supplierProductSchema = new Schema({
    supplierId: reference("Suppliers"),
    productId: reference("Products"),
    isActive: { type: Boolean, required: true },
}, { timestamps: true });
supplierProductSchema.index({ supplierId: 1, productId: 1 }, { unique: true });

export const SupplierProduct = mongoose.model("SupplierProducts", supplierProductSchema);

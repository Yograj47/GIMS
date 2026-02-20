import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: true
    },
    unitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Units',
        required: true
    },
    unitName: { type: String }, 
    multiplier: { type: Number, required: true }, 
    qty: {
        type: Number,
        required: true,
        min: 0.001 
    },
    rate: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true }
});

const transactionSchema = new mongoose.Schema({
    transactionType: {
        type: String,
        enum: ['Purchase', 'Sale', 'Return', 'Damage', 'Adjustment'],
        required: true
    },
    items: [ItemSchema],
    grandTotal: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    partyDetails: {
        name: { type: String, default: "" },
        phone: { type: String, default: "" }
    },
    notes: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("Transactions", transactionSchema);
import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    unitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Unit',
        required: true
    },
    qty: { type: Number, required: true, min: 1 },
    rate: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true }
});

const transactionSchema = new mongoose.Schema({
    transactionType: {
        type: String,
        enum: ['Purchase', 'Sale', 'Return', 'Damage', 'Fixed']
    },
    items: [ItemSchema],
    grandTotal: {
        type: Number,
        required: true
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    partyDetails: {
        name: String,
        phone: String
    }, 
    notes: {
        type: String,
    }
}, {timestamps: true})

export default mongoose.Model("Transactions", transactionSchema);
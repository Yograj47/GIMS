import mongoose from "mongoose";

const MovementSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transactions', 
        required: false 
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    unitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Unit'
    },
    multiplier: { type: Number, default: 1 }, 
    
    quantity: { type: Number, required: true }, // The normalized qty (e.g. 25000 grams)
    movementType: {
        type: String,
        enum: ['IN', 'OUT'],
        required: true
    },
    reason: { type: String, required: false },
    oldQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
}, { 
    timestamps: { createdAt: true, updatedAt: false } 
});

export default mongoose.model("Movements", MovementSchema);
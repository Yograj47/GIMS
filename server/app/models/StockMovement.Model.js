import mongoose from "mongoose";

const StockMovementSchema = new mongoose.Schema({
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
    quantity: {
        type: Number,
        required: true
    },
    movementType: {
        type: String,
        enum: ['IN', 'OUT'],
        required: true
    },
    reason: {
        type: String,
        required: false
    },
    oldQuantity: {
        type: Number,
        required: true
    },
    newQuantity: {
        type: Number,
        required: true
    },
}, { 
    timestamps: { createdAt: true, updatedAt: false } 
});

export default mongoose.model("StockMovements", StockMovementSchema);
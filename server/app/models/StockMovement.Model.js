import mongoose from "mongoose"

const StockMovementSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
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
        required: true
    },
    oldQuantity: {
        type: Number,
        required: true
    },
    newQuantity: {
        type: Number,
        required: true
    },
    notes: {
        type: String,
    },
}, { timestamps: true })

export default mongoose.model("StockMovements", StockMovementSchema)
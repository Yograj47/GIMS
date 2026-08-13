import mongoose from "mongoose";

const movementSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Products",
            required: true,
        },

        transactionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transactions",
        },

        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },

        unitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Units",
            required: true,
        },

        multiplier: {
            type: Number,
            required: true,
            default: 1,
        },

        quantity: {
            type: Number,
            required: true,
            min: 0.001,
        },

        movementType: {
            type: String,
            enum: ["IN", "OUT"],
            required: true,
        },

        reason: {
            type: String,
            default: "",
        },

        oldQuantity: {
            type: Number,
            required: true,
        },

        newQuantity: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: {
            createdAt: true,
            updatedAt: false,
        },
    }
);

export default mongoose.model(
    "Movements",
    movementSchema
);
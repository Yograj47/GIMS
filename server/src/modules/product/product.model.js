import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
        },

        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Category is required"],
        },

        unitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Unit",
            required: [true, "Unit is required"],
        },

        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
            default: null,
        },

        quantity: {
            type: Number,
            min: 0,
            default: 0,
        },

        threshold: {
            type: Number,
            min: 0,
            default: 0,
        },

        basePrice: {
            type: Number,
            required: [true, "Base price is required"],
            min: 0,
        },

        sellingPrice: {
            type: Number,
            required: [true, "Selling price is required"],
            min: 0,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model(
    "Product",
    productSchema
);
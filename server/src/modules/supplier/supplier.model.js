import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Supplier name is required"],
            trim: true,
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: null,
        },

        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true,
        },

        notes: {
            type: String,
            trim: true,
            default: "",
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
    "Suppliers",
    supplierSchema
);
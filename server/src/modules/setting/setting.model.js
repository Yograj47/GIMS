import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
    {
        storeName: {
            type: String,
            required: [true, "Store name is required"],
            trim: true,
            default: "My Inventory System",
        },

        location: {
            type: String,
            trim: true,
            default: "Main Branch",
        },

        enableEmailNotifications: {
            type: Boolean,
            default: true,
        },

        lowStockThreshold: {
            type: Number,
            default: 10,
            min: [0, "Threshold cannot be negative"],
        },

        adminEmail: {
            type: String,
            trim: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please provide a valid email address",
            ],
        },

        currency: {
            type: String,
            default: "NPR",
        },

        taxRate: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

settingSchema.pre(
    "save",
    async function (next) {
        if (!this.isNew) {
            return next();
        }

        const count =
            await mongoose.models.Setting.countDocuments();

        if (count > 0) {
            return next(
                new Error(
                    "Only one settings document can exist."
                )
            );
        }

        next();
    }
);

const Setting = mongoose.model(
    "Setting",
    settingSchema
);

export default Setting;
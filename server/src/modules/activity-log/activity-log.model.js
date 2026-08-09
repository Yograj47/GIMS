import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
    {
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        action: {
            type: String,
            required: true,
            trim: true,
        },

        type: {
            type: String,
            required: true,
            trim: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: {
            createdAt: true,
            updatedAt: false,
        },
        versionKey: false,
    }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ type: 1 });
activityLogSchema.index({ action: 1 });

export default mongoose.model(
    "ActivityLog",
    activityLogSchema
);
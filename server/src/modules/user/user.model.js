import mongoose from "mongoose";
import { ROLES } from "../../shared/constants/index.js";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please add a name"],
            trim: true,
        },

        email: {
            type: String,
            required: [true, "Please add an email"],
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: [true, "Please add a password"],
        },

        avatar: {
            type: String,
            default: null,
        },

        role: {
            type: String,
            enum: Object.values(ROLES),
            default: ROLES.STAFF,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        verifyOtp: String,

        verifyOtpExpiresAt: {
            type: Number,
            default: 0,
        },

        resetOtp: String,

        resetOtpExpiresAt: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.index({ email: 1 });

export default mongoose.model("User", userSchema);
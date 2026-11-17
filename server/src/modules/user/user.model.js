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
            enum: Object.values(ROLES).filter((role) => role !== ROLES.CUSTOMER),
            required: true,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        verifyOtp: String,
        tokenVersion: { type: Number, default: 0 },
        verifyOtpAttempts: { type: Number, default: 0 },
        resetOtpAttempts: { type: Number, default: 0 },

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

export default mongoose.model("Users", userSchema);

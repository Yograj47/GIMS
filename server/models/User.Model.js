import mongoose from "mongoose"
import { type } from "node:os"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"]
    },
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please add a password"]
    },
    role: {
        type: String,
        enum: ["admin", "staff"],
        default: "staff"
    },
    verifyOpt: {
        type: String
    },
    verifyOptExpiryAt: {
        type: Number,
        default: 0
    },
    isVerfied: {
        type: Boolean,
        default: false
    },
    resetOpt: {
        type: String
    },
    resetOptExpiryAt: {
        type: Number,
        default: 0
    }
})

export default mongoose.model('User', userSchema)
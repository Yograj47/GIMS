import mongoose from "mongoose"

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
        enum: ["owner", "staff","admin"],
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

export default mongoose.model('Users', userSchema)
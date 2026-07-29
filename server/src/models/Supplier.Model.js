import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter name"]
    },
    phone: {
        type: String,
        required: [true, "Please enter phone number"]
    },
    email: {
        type: String,
        required: false,
    },
    address: {
        type: String,
        required: [true, "Please enter address"]
    },
    notes: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true
    }

})

export default mongoose.model("Suppliers", supplierSchema)
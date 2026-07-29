import mongoose from "mongoose";

const productUnitSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: true
    },
    unitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Units",
        required: true
    },
    multiplier: {
        type: Number,
        default: 1
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isFractionable: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    }

})

export default mongoose.model("ProductUnits", productUnitSchema);
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required.'],
        trim: true,
        minlength: [1, 'Product name cannot be empty.']
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categories',
        required: [true, 'Category reference is required.']
    },
    unitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Units',
        required: [true, 'Unit reference is required.']
    },
    quantity: {
        type: Number,
        min: [0, 'Quantity cannot be negative.'],
        default: 0
    },
    threshold: {
        type: Number,
        min: [0, 'Threshold cannot be negative.'],
        default: 0
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Suppliers',
        required: false
    },
    basePrice: {
        type: Number,
        required: [true, 'Base price is required.'],
        min: [0.01, 'Base price must be greater than zero.']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sellingPrice: {
        type: Number,
        required: [true, 'Selling price is required.'],
        min: [0.01, 'Selling price must be greater than zero.'],
        validate: {
            validator: function (v) {
                const basePrice = this.basePrice || (this.getUpdate && this.getUpdate().$set ? this.getUpdate().$set.basePrice : null);
                return v >= basePrice;
            },
            message: props => `Selling price (${props.value}) must be greater than or equal to the base price!`
        }
    }
}, {
    timestamps: true
});

export default mongoose.model("Products", productSchema);
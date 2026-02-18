import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a unit full name"],
        unique: true
    },
    shortForm: {
        type: String,
        required: [true, "Please add a unit short form"],
        unique: true
    },
    unitType: {
        type: String,
        enum: ['weight', 'volume', 'count', 'pack'],
    },
    baseUnit: {
        type: Boolean,
        default: false
    },
    multiplierToBase: {
        type: Number,
        required: [true, "Please provide the conversion multiplier"],
        min: [1, "Multiplier cannot be less than 1"],
        default: 1 
    },
    isFractional: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Units', unitSchema);
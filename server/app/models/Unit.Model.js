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
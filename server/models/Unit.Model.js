import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema({
    fullForm: {
        type: String,
        required: [true, "Please add a unit full form"],
        unique: true
    },
    shortForm: {
        type: String,
        required: [true, "Please add a unit short form"],
        unique: true
    },
    UnitOfMeasurement: {
        type: String,
        required: [true, "Please add a unit of measurement"],
    },
    IsFractional: {
        type: Boolean,
        required: [true, "Please specify if the unit is fractional"],
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Units', unitSchema);
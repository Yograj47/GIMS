import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a category name"],
        unique: true
    },
    description: {
        type: String,
    },
}, {
    timestamps: true
});

export default mongoose.model('Categories', categorySchema);
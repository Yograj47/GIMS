import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Products",
    required: true
  },

  type: {
    type: String,
    enum: [
      "low-stock",
      "out-of-stock",
      "price-change"
    ],
    required: true
  },

  message: {
    type: String,
    required: true
  },

  resolved: {
    type: Boolean,
    default: false
  },

  resolvedAt: Date

}, { timestamps: true });

alertSchema.index({productId: 1, resolved: 1})

export default mongoose.model("Alerts", alertSchema)

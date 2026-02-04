import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  type: {
    type: String,
    enum: [
      "low-stock",
      "out-of-stock",
      "expiry-warning",
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

export default mongoose.model("Alerts", alertSchema)

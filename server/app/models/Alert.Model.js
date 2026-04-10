import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Products", // Ensure this matches your Product model export name
    required: true
  },
  type: {
    type: String,
    enum: ["low-stock", "out-of-stock", "price-change", "threshold-reached"], // Added threshold-reached to match your TS type
    required: true
  },
  // ADD THESE TWO FIELDS:
  severity: {
    type: String,
    enum: ["info", "warning", "critical"],
    default: "info"
  },
  snapshotValue: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  acknowledged: {
    type: Boolean,
    default: false
  },
  acknowledgedAt: Date,
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users"
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: Date
}, { timestamps: true });

alertSchema.index(
  { productId: 1, type: 1, resolved: 1 },
  { unique: true, partialFilterExpression: { resolved: false } }
);

export default mongoose.model("Alerts", alertSchema)

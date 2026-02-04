import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  action: {
    type: String,
    required: true
  },

  type: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },


}, {timestamps: {createdAt: true, updatedAt: false}} );

export default mongoose.model("ActivityLog", activityLogSchema);

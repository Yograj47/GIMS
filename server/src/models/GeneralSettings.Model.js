import mongoose from "mongoose";

const generalSettingsSchema = new mongoose.Schema(
  {
    // Store Identity
    storeName: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
      default: "My Inventory System",
    },
    location: {
      type: String,
      trim: true,
      default: "Main Branch",
    },

    // Notification Logic
    enableEmailNotifications: {
      type: Boolean,
      default: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: [0, "Threshold cannot be negative"],
    },
    adminEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    currency: {
      type: String,
      default: "NPR",
    },
    taxRate: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false
  }
);

generalSettingsSchema.pre('save', async function (next) {
  const count = await mongoose.models.GeneralSettings.countDocuments();
  if (count > 0 && this.isNew) {
    throw new Error('Only one settings document can exist.');
  }
});

const GeneralSettings = mongoose.model("GeneralSettings", generalSettingsSchema);

export default GeneralSettings;
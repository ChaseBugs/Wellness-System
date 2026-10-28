const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    message: { type: String, required: true },
    audience: { type: String, enum: ["all", "free", "premium", "inactive"], default: "all", index: true },
    type: { type: String, enum: ["motivation", "reminder", "update", "promotion"], default: "motivation" },
    scheduledAt: Date,
    sentAt: Date,
    setup: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);

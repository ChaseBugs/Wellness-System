const mongoose = require("mongoose");

const appSettingSchema = new mongoose.Schema(
  {
    key: { type: String, trim: true, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    setup: { type: Boolean, default: false, index: true },
    description: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("AppSetting", appSettingSchema);

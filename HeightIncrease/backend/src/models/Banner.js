const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    subtitle: String,
    placement: {
      type: String,
      enum: ["home-top", "home-card", "reports-top", "modal", "discover"],
      default: "home-top",
      index: true
    },
    imageUrl: String,
    icon: String,
    ctaLabel: String,
    ctaUrl: String,
    backgroundColor: { type: String, default: "#6696f6" },
    startsAt: Date,
    endsAt: Date,
    setup: { type: Boolean, default: false, index: true },
    priority: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);

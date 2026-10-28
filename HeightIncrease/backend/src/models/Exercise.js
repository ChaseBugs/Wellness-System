const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true, index: "text" },
    slug: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    category: {
      type: String,
      enum: ["stretching", "posture", "strength", "cardio", "yoga", "warmup", "custom"],
      default: "stretching",
      index: true
    },
    durationSeconds: { type: Number, default: 20, min: 1 },
    calories: { type: Number, default: 0, min: 0 },
    difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    ageGroup: { type: String, default: "all" },
    imageUrl: String,
    videoUrl: String,
    equipment: [{ type: String, trim: true }],
    targetAreas: [{ type: String, trim: true }],
    steps: [{ type: String, trim: true }],
    tips: [{ type: String, trim: true }],
    doctor_verified: { type: Boolean, default: false, index: true },
    setup: { type: Boolean, default: false, index: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exercise", exerciseSchema);

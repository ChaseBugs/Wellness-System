const mongoose = require("mongoose");

const planExerciseSchema = new mongoose.Schema(
  {
    exercise: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise", required: true },
    order: { type: Number, default: 0 },
    durationSeconds: { type: Number, min: 1 },
    reps: { type: Number, min: 0 },
    sets: { type: Number, default: 1, min: 1 },
    restSeconds: { type: Number, default: 10, min: 0 }
  },
  { _id: false }
);

const trainingPlanSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true, index: "text" },
    subtitle: String,
    description: String,
    level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner", index: true },
    type: { type: String, enum: ["featured", "daily", "weekly", "custom-template"], default: "daily", index: true },
    bannerImageUrl: String,
    icon: String,
    estimatedMinutes: { type: Number, default: 5 },
    goal: String,
    exercises: [planExerciseSchema],
    tags: [{ type: String, trim: true }],
    doctor_verified: { type: Boolean, default: false, index: true },
    setup: { type: Boolean, default: false, index: true },
    isPremium: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrainingPlan", trainingPlanSchema);

const mongoose = require("mongoose");

const completedExerciseSchema = new mongoose.Schema(
  {
    exercise: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise" },
    title: String,
    durationSeconds: Number,
    calories: Number
  },
  { _id: false }
);

const dailyLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true, index: true },
    heightCm: Number,
    weightKg: Number,
    sleepHours: Number,
    waterGlasses: Number,
    mood: { type: String, enum: ["great", "good", "okay", "tired", "bad"] },
    workoutMinutes: { type: Number, default: 0 },
    completedExercises: [completedExerciseSchema],
    notes: String
  },
  { timestamps: true }
);

dailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailyLog", dailyLogSchema);

const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, trim: true, required: true },
    type: { type: String, enum: ["height", "weight", "workout", "sleep", "custom"], default: "workout" },
    targetValue: Number,
    currentValue: { type: Number, default: 0 },
    unit: String,
    startsAt: Date,
    dueAt: Date,
    status: { type: String, enum: ["active", "completed", "cancelled"], default: "active", index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);

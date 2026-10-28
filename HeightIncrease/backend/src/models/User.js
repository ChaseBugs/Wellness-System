const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const measurementSchema = new mongoose.Schema(
  {
    currentHeightCm: { type: Number, min: 20, max: 260 },
    targetHeightCm: { type: Number, min: 20, max: 260 },
    weightKg: { type: Number, min: 1, max: 300 },
    birthDate: Date,
    gender: { type: String, enum: ["male", "female", "other", "prefer_not_to_say"] }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, required: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    avatarUrl: String,
    status: { type: String, enum: ["active", "blocked"], default: "active", index: true },
    streakDays: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    measurements: measurementSchema,
    preferences: {
      units: { type: String, enum: ["metric", "imperial"], default: "metric" },
      notificationsEnabled: { type: Boolean, default: true }
    },
    lastLoginAt: Date
  },
  { timestamps: true }
);

userSchema.virtual("password").set(function setPassword(password) {
  if (password) {
    this.passwordHash = bcrypt.hashSync(password, 10);
  }
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject({ virtuals: true });
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("User", userSchema);

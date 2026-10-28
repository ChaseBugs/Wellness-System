import mongoose, { Schema, type Model } from "mongoose";
import { reviewFlag } from "./common.js";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    goal: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "non_binary"], required: true },
    age: { type: Number, min: 13, max: 120 },
    heightCm: { type: Number, min: 50 },
    currentWeightKg: { type: Number, min: 20 },
    targetWeightKg: { type: Number, min: 20 },
    calorieGoal: { type: Number, min: 0 },
    dietaryRestrictions: [{ type: String, trim: true }],
    medicalConditions: [{ type: String, trim: true }],
    programStage: { type: String, default: "onboarding" },
    dataSource: { type: String, default: "user_input", trim: true, index: true },
    sourceNote: { type: String, trim: true },
    ...reviewFlag
  },
  { timestamps: true }
);

export const User = (mongoose.models.User || mongoose.model("User", userSchema)) as Model<any>;

import mongoose, { Schema, type Model } from "mongoose";
import { dailyValuePercentSchema, reviewFlag, sourceTrace } from "./common.js";

const dailyValueProfileSchema = new Schema(
  {
    profileKey: { type: String, required: true, unique: true, trim: true, index: true },
    label: { type: String, required: true, trim: true },
    ageMin: { type: Number, required: true, min: 0 },
    ageMax: { type: Number, required: true, min: 0 },
    gender: { type: String, enum: ["all", "male", "female"], default: "all" },
    purpose: { type: String, required: true, trim: true, index: true },
    notes: { type: String, trim: true },
    ...sourceTrace,
    values: { type: dailyValuePercentSchema, default: {} },
    ...reviewFlag
  },
  { timestamps: true }
);

export const DailyValueProfile =
  (mongoose.models.DailyValueProfile || mongoose.model("DailyValueProfile", dailyValueProfileSchema)) as Model<any>;

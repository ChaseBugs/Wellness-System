import mongoose, { Schema, type Model } from "mongoose";
import { reviewFlag } from "./common.js";

const weightEntrySchema = new Schema(
  {
    userName: { type: String, required: true, trim: true },
    date: { type: Date, required: true, index: true },
    weightKg: { type: Number, required: true, min: 20 },
    note: { type: String, trim: true },
    dataSource: { type: String, default: "user_input", trim: true, index: true },
    sourceNote: { type: String, trim: true },
    ...reviewFlag
  },
  { timestamps: true }
);

export const WeightEntry = (mongoose.models.WeightEntry || mongoose.model("WeightEntry", weightEntrySchema)) as Model<any>;

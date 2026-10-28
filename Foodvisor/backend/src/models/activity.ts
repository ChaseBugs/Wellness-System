import mongoose, { Schema, type Model } from "mongoose";
import { reviewFlag } from "./common.js";

const activitySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, trim: true, index: true },
    caloriesPerHour: { type: Number, required: true, min: 0 },
    metValue: { type: Number, required: true, min: 0 },
    icon: { type: String, trim: true },
    description: { type: String, trim: true },
    dataSource: { type: String, trim: true, index: true },
    sourceCode: { type: String, trim: true, index: true },
    sourceNote: { type: String, trim: true },
    sourceRefs: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    ...reviewFlag
  },
  { timestamps: true }
);

export const Activity = (mongoose.models.Activity || mongoose.model("Activity", activitySchema)) as Model<any>;

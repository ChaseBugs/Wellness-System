import mongoose, { Schema, type Model } from "mongoose";
import { reviewFlag } from "./common.js";

const programSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    stage: { type: String, required: true, trim: true },
    focus: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    cta: { type: String, default: "Next" },
    dataSource: { type: String, default: "web_admin", trim: true, index: true },
    sourceNote: { type: String, trim: true },
    sourceRefs: [{ type: String, trim: true }],
    ...reviewFlag
  },
  { timestamps: true }
);

export const Program = (mongoose.models.Program || mongoose.model("Program", programSchema)) as Model<any>;

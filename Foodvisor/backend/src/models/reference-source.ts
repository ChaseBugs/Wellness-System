import mongoose, { Schema, type Model } from "mongoose";
import { reviewFlag } from "./common.js";

const referenceSourceSchema = new Schema(
  {
    sourceKey: { type: String, required: true, unique: true, trim: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    standardCode: { type: String, trim: true, index: true },
    year: { type: Number, min: 1900, max: 2100, index: true },
    category: { type: String, required: true, trim: true, index: true },
    topic: { type: String, required: true, trim: true, index: true },
    conditionKey: { type: String, trim: true, index: true },
    filePath: { type: String, required: true, trim: true },
    language: { type: String, default: "zh-CN", trim: true },
    dataSource: { type: String, required: true, trim: true, index: true },
    sourceNote: { type: String, trim: true },
    sourceRefs: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    ...reviewFlag
  },
  { timestamps: true, collection: "referenceSources" }
);

export const ReferenceSource =
  (mongoose.models.ReferenceSource || mongoose.model("ReferenceSource", referenceSourceSchema)) as Model<any>;

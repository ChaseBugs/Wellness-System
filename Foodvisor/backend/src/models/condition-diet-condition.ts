import mongoose, { Schema, type Model } from "mongoose";
import { reviewFlag } from "./common.js";

const conditionDietConditionSchema = new Schema(
  {
    conditionKey: { type: String, required: true, unique: true, trim: true, index: true },
    conditionLabel: { type: String, required: true, trim: true, index: true },
    category: { type: String, default: "condition_diet", trim: true, index: true },
    descriptionKo: { type: String, trim: true },
    sortOrder: { type: Number, default: 1, index: true },
    dataSource: { type: String, required: true, trim: true, index: true },
    sourceNote: { type: String, trim: true },
    sourceRefs: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    ...reviewFlag
  },
  { timestamps: true, collection: "conditionDietConditions" }
);

export const ConditionDietCondition =
  (mongoose.models.ConditionDietCondition || mongoose.model("ConditionDietCondition", conditionDietConditionSchema)) as Model<any>;

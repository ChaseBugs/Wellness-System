import mongoose, { Schema, type Model } from "mongoose";
import { reviewFlag } from "./common.js";

const dataValidationRuleSchema = new Schema(
  {
    ruleKey: { type: String, required: true, unique: true, trim: true, index: true },
    targetCollection: { type: String, required: true, trim: true, index: true },
    fieldPath: { type: String, required: true, trim: true, index: true },
    ruleType: { type: String, required: true, trim: true, index: true },
    expectedUnit: { type: String, trim: true },
    required: { type: Boolean, default: false, index: true },
    minValue: { type: Number },
    maxValue: { type: Number },
    messageKo: { type: String, required: true, trim: true },
    dataSource: { type: String, required: true, trim: true, index: true },
    sourceNote: { type: String, trim: true },
    sourceRefs: [{ type: String, trim: true }],
    ...reviewFlag
  },
  { timestamps: true, collection: "dataValidationRules" }
);

export const DataValidationRule =
  (mongoose.models.DataValidationRule || mongoose.model("DataValidationRule", dataValidationRuleSchema)) as Model<any>;

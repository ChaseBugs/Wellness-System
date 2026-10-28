import mongoose, { Schema, type Model } from "mongoose";
import { reviewFlag } from "./common.js";

const conditionDietRuleSchema = new Schema(
  {
    ruleKey: { type: String, required: true, unique: true, trim: true, index: true },
    conditionKey: { type: String, required: true, trim: true, index: true },
    conditionLabel: { type: String, required: true, trim: true, index: true },
    ruleType: { type: String, required: true, trim: true, index: true },
    priority: { type: Number, default: 1, index: true },
    nutrientKey: { type: String, trim: true, index: true },
    comparator: { type: String, enum: ["eq", "lt", "lte", "gt", "gte", "range", "avoid", "prefer"], default: "eq" },
    targetValue: { type: Number },
    targetMin: { type: Number },
    targetMax: { type: Number },
    unit: { type: String, trim: true },
    recommendationKo: { type: String, required: true, trim: true },
    recommendationZh: { type: String, trim: true },
    foodTagsPrefer: [{ type: String, trim: true }],
    foodTagsAvoid: [{ type: String, trim: true }],
    cautionTags: [{ type: String, trim: true }],
    dataSource: { type: String, required: true, trim: true, index: true },
    sourceNote: { type: String, trim: true },
    sourceRefs: [{ type: String, trim: true }],
    ...reviewFlag
  },
  { timestamps: true, collection: "conditionDietRules" }
);

export const ConditionDietRule =
  (mongoose.models.ConditionDietRule || mongoose.model("ConditionDietRule", conditionDietRuleSchema)) as Model<any>;

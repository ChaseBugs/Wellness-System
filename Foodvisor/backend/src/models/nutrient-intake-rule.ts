import mongoose, { Schema, type Model } from "mongoose";
import { reviewFlag } from "./common.js";

const nutrientIntakeRuleSchema = new Schema(
  {
    ruleKey: { type: String, required: true, unique: true, trim: true, index: true },
    standardCode: { type: String, required: true, trim: true, index: true },
    nutrientKey: { type: String, required: true, trim: true, index: true },
    nutrientLabel: { type: String, required: true, trim: true, index: true },
    referenceType: { type: String, required: true, trim: true, index: true },
    unit: { type: String, required: true, trim: true },
    rawValue: { type: String, required: true, trim: true },
    comparator: { type: String, enum: ["eq", "lt", "lte", "gt", "gte", "range"], default: "eq", index: true },
    value: { type: Number },
    valueMin: { type: Number },
    valueMax: { type: Number },
    ageGroup: { type: String, required: true, trim: true, index: true },
    ageMin: { type: Number, index: true },
    ageMax: { type: Number, index: true },
    gender: { type: String, enum: ["all", "male", "female"], default: "all", index: true },
    lifeStage: { type: String, default: "general", trim: true, index: true },
    populationGroup: { type: String, default: "general", trim: true, index: true },
    physicalActivityLevel: { type: String, trim: true, index: true },
    dataSource: { type: String, required: true, trim: true, index: true },
    sourceNote: { type: String, trim: true },
    sourceRefs: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    ...reviewFlag
  },
  { timestamps: true, collection: "nutrientIntakeRules" }
);

nutrientIntakeRuleSchema.index({ nutrientKey: 1, ageMin: 1, ageMax: 1, gender: 1, referenceType: 1 });

export const NutrientIntakeRule =
  (mongoose.models.NutrientIntakeRule || mongoose.model("NutrientIntakeRule", nutrientIntakeRuleSchema)) as Model<any>;

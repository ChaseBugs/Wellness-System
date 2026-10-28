import mongoose, { Schema, type Model } from "mongoose";
import { reviewFlag } from "./common.js";

const riskAssessmentRuleSchema = new Schema(
  {
    ruleKey: { type: String, required: true, unique: true, trim: true, index: true },
    standardCode: { type: String, required: true, trim: true, index: true },
    metricKey: { type: String, required: true, trim: true, index: true },
    metricLabel: { type: String, required: true, trim: true },
    populationGroup: { type: String, required: true, trim: true, index: true },
    ageMin: { type: Number, index: true },
    ageMax: { type: Number, index: true },
    gender: { type: String, enum: ["all", "male", "female"], default: "all", index: true },
    thresholds: { type: Schema.Types.Mixed, default: [] },
    interpretationKo: { type: String, required: true, trim: true },
    dataSource: { type: String, required: true, trim: true, index: true },
    sourceNote: { type: String, trim: true },
    sourceRefs: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    ...reviewFlag
  },
  { timestamps: true, collection: "riskAssessmentRules" }
);

export const RiskAssessmentRule =
  (mongoose.models.RiskAssessmentRule || mongoose.model("RiskAssessmentRule", riskAssessmentRuleSchema)) as Model<any>;

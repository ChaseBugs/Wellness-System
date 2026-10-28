import mongoose, { Schema, type Model } from "mongoose";
import { humanTypeScoreSchema, reviewFlag } from "./common.js";

const humanTypeSurveyAnswerSchema = new Schema(
  {
    questionId: { type: String, required: true, trim: true },
    value: Schema.Types.Mixed,
    labelKo: { type: String, trim: true },
    scoreSnapshot: { type: humanTypeScoreSchema, default: {} }
  },
  { _id: false }
);

const humanTypeSurveySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    userName: { type: String, trim: true, index: true },
    status: { type: String, enum: ["draft", "completed", "reviewed", "archived"], default: "completed", index: true },
    classifierVersion: { type: String, default: "sasang-v1-curated", trim: true },
    answers: { type: [humanTypeSurveyAnswerSchema], default: [] },
    scores: { type: humanTypeScoreSchema, default: {} },
    resultType: { type: String, enum: ["TE", "SE", "SY", "TY", "MIXED", "REVIEW"], default: "REVIEW", index: true },
    resultLabelKo: { type: String, trim: true },
    secondType: { type: String, trim: true },
    confidence: { type: Number, default: 0, min: 0, max: 1 },
    totalPossible: { type: Number, default: 0 },
    recommendationTags: [{ type: String, trim: true }],
    cautionTags: [{ type: String, trim: true }],
    summaryKo: { type: String, trim: true },
    notes: { type: String, trim: true },
    dataSource: { type: String, default: "user_input", trim: true, index: true },
    sourceNote: { type: String, trim: true },
    ...reviewFlag
  },
  { timestamps: true, collection: "humanTypeSurvey" }
);

export const HumanTypeSurvey =
  (mongoose.models.HumanTypeSurvey || mongoose.model("HumanTypeSurvey", humanTypeSurveySchema)) as Model<any>;

import mongoose, { Schema, type Model } from "mongoose";
import { humanTypeOptionSchema, reviewFlag } from "./common.js";

const humanTypeQASchema = new Schema(
  {
    questionId: { type: String, required: true, unique: true, trim: true, index: true },
    order: { type: Number, required: true, index: true },
    categoryKey: { type: String, required: true, trim: true, index: true },
    categoryNameKo: { type: String, required: true, trim: true },
    categoryNameEn: { type: String, trim: true },
    promptKo: { type: String, required: true, trim: true, index: true },
    inputType: { type: String, required: true, enum: ["single", "scale", "multi", "text"], default: "single" },
    scaleMin: { type: Number, default: 1 },
    scaleMax: { type: Number, default: 5 },
    scaleMinLabelKo: { type: String, trim: true },
    scaleMaxLabelKo: { type: String, trim: true },
    options: { type: [humanTypeOptionSchema], default: [] },
    answers: { type: [humanTypeOptionSchema], default: [] },
    answerListKo: { type: String, trim: true },
    weight: { type: Number, default: 1 },
    isCore: { type: Boolean, default: false, index: true },
    useForClassification: { type: Boolean, default: true, index: true },
    useForRecommendation: { type: Boolean, default: false, index: true },
    scoringNoteKo: { type: String, trim: true },
    analysisNoteKo: { type: String, trim: true },
    dataSource: { type: String, trim: true, index: true },
    sourceNote: { type: String, trim: true },
    sourceRefs: [{ type: String, trim: true }],
    ...reviewFlag
  },
  { timestamps: true, collection: "humanTypeQA" }
);

export const HumanTypeQA = (mongoose.models.HumanTypeQA || mongoose.model("HumanTypeQA", humanTypeQASchema)) as Model<any>;

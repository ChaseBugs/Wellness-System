import mongoose, { Schema, type Model } from "mongoose";
import { reviewFlag } from "./common.js";

const nutritionConstraintSchema = new Schema(
  {
    profileKey: { type: String, required: true, trim: true, index: true },
    nutrientKey: { type: String, required: true, trim: true, index: true },
    nutrientLabel: { type: String, required: true, trim: true },
    unit: { type: String, trim: true },
    lowerBound: { type: Number, default: 0 },
    upperBound: { type: Number, default: 0 },
    isPercentOfCalories: { type: Boolean, default: false },
    caloriesPerGram: { type: Number, default: 0 },
    dataSource: { type: String, trim: true, index: true },
    sourceNote: { type: String, trim: true },
    sourceRefs: [{ type: String, trim: true }],
    ...reviewFlag
  },
  { timestamps: true }
);

nutritionConstraintSchema.index({ profileKey: 1, nutrientKey: 1 }, { unique: true });

export const NutritionConstraint =
  (mongoose.models.NutritionConstraint || mongoose.model("NutritionConstraint", nutritionConstraintSchema)) as Model<any>;

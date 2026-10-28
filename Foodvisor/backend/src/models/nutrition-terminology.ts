import mongoose, { Schema, type Model } from "mongoose";
import { reviewFlag } from "./common.js";

const nutritionTerminologySchema = new Schema(
  {
    termKey: { type: String, required: true, unique: true, trim: true, index: true },
    category: { type: String, required: true, trim: true, index: true },
    chineseTerm: { type: String, required: true, trim: true, index: true },
    englishTerm: { type: String, trim: true, index: true },
    koreanTerm: { type: String, trim: true, index: true },
    abbreviation: { type: String, trim: true, index: true },
    unit: { type: String, trim: true },
    definitionKo: { type: String, required: true, trim: true },
    aliases: [{ type: String, trim: true }],
    dataSource: { type: String, required: true, trim: true, index: true },
    sourceNote: { type: String, trim: true },
    sourceRefs: [{ type: String, trim: true }],
    ...reviewFlag
  },
  { timestamps: true, collection: "nutritionTerminology" }
);

export const NutritionTerminology =
  (mongoose.models.NutritionTerminology || mongoose.model("NutritionTerminology", nutritionTerminologySchema)) as Model<any>;

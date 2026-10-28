import mongoose, { Schema, type Model } from "mongoose";
import { reviewFlag } from "./common.js";

const recipeIngredientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    koreanName: { type: String, trim: true, index: true },
    foodName: { type: String, trim: true, index: true },
    fdcId: { type: Number, index: true },
    category: { type: String, trim: true, index: true },
    amount: { type: Number, default: 0 },
    unit: { type: String, trim: true, default: "g" },
    preparation: { type: String, trim: true },
    optional: { type: Boolean, default: false },
    substitutes: [{ type: String, trim: true }],
    notes: { type: String, trim: true },
    dataSource: { type: String, default: "web_admin", trim: true, index: true },
    sourceNote: { type: String, trim: true },
    sourceRefs: [{ type: String, trim: true }],
    ...reviewFlag
  },
  { timestamps: true }
);

export const RecipeIngredient =
  (mongoose.models.RecipeIngredient || mongoose.model("RecipeIngredient", recipeIngredientSchema)) as Model<any>;

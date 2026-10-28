import mongoose, { Schema, type Model } from "mongoose";
import { macroSchema, reviewFlag } from "./common.js";

const cookingStepSchema = new Schema(
  {
    order: { type: Number, required: true, min: 1 },
    title: { type: String, trim: true },
    instruction: { type: String, required: true, trim: true },
    durationMinutes: { type: Number, default: 0 },
    temperatureC: { type: Number, default: 0 },
    technique: { type: String, trim: true },
    equipment: [{ type: String, trim: true }],
    tips: { type: String, trim: true }
  },
  { _id: false }
);

const recipeNutritionSchema = new Schema(
  {
    servings: { type: Number, default: 1 },
    servingSize: { type: String, trim: true },
    caloriesPerServing: { type: Number, default: 0 },
    macrosPerServing: { type: macroSchema, default: {} },
    sourceNote: { type: String, trim: true }
  },
  { _id: false }
);

const recipeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    mealType: { type: String, required: true, enum: ["breakfast", "lunch", "dinner", "snack"] },
    calories: { type: Number, required: true, min: 0 },
    prepTimeMinutes: { type: Number, default: 10 },
    cookTimeMinutes: { type: Number, default: 0 },
    totalTimeMinutes: { type: Number, default: 0 },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
    cuisine: { type: String, trim: true },
    cookingMethods: [{ type: String, trim: true }],
    equipment: [{ type: String, trim: true }],
    ingredients: [{ type: String, trim: true }],
    ingredientRefs: [{ type: Schema.Types.ObjectId, ref: "RecipeIngredient" }],
    steps: [{ type: String, trim: true }],
    cookingSteps: { type: [cookingStepSchema], default: [] },
    nutrition: { type: recipeNutritionSchema, default: {} },
    macros: { type: macroSchema, default: {} },
    allergens: [{ type: String, trim: true }],
    dietUseCases: [{ type: String, trim: true }],
    cautionGroups: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    dataSource: { type: String, default: "web_admin", trim: true, index: true },
    sourceNote: { type: String, trim: true },
    sourceRefs: [{ type: String, trim: true }],
    imageUrl: { type: String, trim: true },
    ...reviewFlag
  },
  { timestamps: true }
);

export const Recipe = (mongoose.models.Recipe || mongoose.model("Recipe", recipeSchema)) as Model<any>;

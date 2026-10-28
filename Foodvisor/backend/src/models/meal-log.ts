import mongoose, { Schema, type Model } from "mongoose";
import { macroSchema, reviewFlag } from "./common.js";

const mealLogSchema = new Schema(
  {
    userName: { type: String, required: true, trim: true },
    date: { type: Date, required: true, index: true },
    mealType: { type: String, required: true, enum: ["breakfast", "lunch", "dinner", "snack"] },
    foodName: { type: String, required: true, trim: true },
    calories: { type: Number, required: true, min: 0 },
    macros: { type: macroSchema, default: {} },
    source: { type: String, enum: ["photo", "barcode", "search", "voice", "favorite"], default: "search" },
    photoUrl: { type: String, trim: true },
    dataSource: { type: String, default: "user_input", trim: true, index: true },
    sourceNote: { type: String, trim: true },
    ...reviewFlag
  },
  { timestamps: true }
);

export const MealLog = (mongoose.models.MealLog || mongoose.model("MealLog", mealLogSchema)) as Model<any>;

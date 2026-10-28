import { Schema } from "mongoose";

export const reviewFlag = {
  doctor_verified: { type: Boolean, default: false, index: true }
};

export const sourceTrace = {
  dataSource: { type: String, trim: true, index: true },
  sourceNote: { type: String, trim: true },
  sourceRefs: [{ type: String, trim: true }]
};

export const macroSchema = new Schema(
  {
    protein: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 }
  },
  { _id: false }
);

export const vitaminSchema = new Schema(
  {
    vitaminA: { type: Number, default: 0 },
    vitaminB1: { type: Number, default: 0 },
    vitaminB2: { type: Number, default: 0 },
    vitaminB3: { type: Number, default: 0 },
    vitaminB6: { type: Number, default: 0 },
    vitaminB12: { type: Number, default: 0 },
    vitaminC: { type: Number, default: 0 },
    vitaminD: { type: Number, default: 0 },
    vitaminE: { type: Number, default: 0 },
    vitaminK: { type: Number, default: 0 },
    folate: { type: Number, default: 0 }
  },
  { _id: false }
);

export const mineralSchema = new Schema(
  {
    calcium: { type: Number, default: 0 },
    iron: { type: Number, default: 0 },
    magnesium: { type: Number, default: 0 },
    potassium: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
    zinc: { type: Number, default: 0 }
  },
  { _id: false }
);

export const dailyValuePercentSchema = new Schema(
  {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    saturatedFat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
    cholesterol: { type: Number, default: 0 },
    calcium: { type: Number, default: 0 },
    iron: { type: Number, default: 0 },
    magnesium: { type: Number, default: 0 },
    potassium: { type: Number, default: 0 },
    zinc: { type: Number, default: 0 },
    vitaminA: { type: Number, default: 0 },
    vitaminB1: { type: Number, default: 0 },
    vitaminB2: { type: Number, default: 0 },
    vitaminB3: { type: Number, default: 0 },
    vitaminB6: { type: Number, default: 0 },
    vitaminB12: { type: Number, default: 0 },
    vitaminC: { type: Number, default: 0 },
    vitaminD: { type: Number, default: 0 },
    vitaminE: { type: Number, default: 0 },
    vitaminK: { type: Number, default: 0 },
    folate: { type: Number, default: 0 }
  },
  { _id: false }
);

export const dailyValuePercentByProfileSchema = new Schema(
  {
    profileKey: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    purpose: { type: String, required: true, trim: true },
    values: { type: dailyValuePercentSchema, default: {} }
  },
  { _id: false }
);

export const humanTypeScoreSchema = new Schema(
  {
    TE: { type: Number, default: 0 },
    SE: { type: Number, default: 0 },
    SY: { type: Number, default: 0 },
    TY: { type: Number, default: 0 }
  },
  { _id: false }
);

export const humanTypeOptionSchema = new Schema(
  {
    value: { type: String, required: true, trim: true },
    labelKo: { type: String, required: true, trim: true },
    score: { type: humanTypeScoreSchema, default: {} },
    recommendationTags: [{ type: String, trim: true }],
    cautionTags: [{ type: String, trim: true }]
  },
  { _id: false }
);

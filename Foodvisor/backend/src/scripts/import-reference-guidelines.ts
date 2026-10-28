import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../db.js";
import { ConditionDietCondition } from "../models/condition-diet-condition.js";
import { ConditionDietRule } from "../models/condition-diet-rule.js";
import { DataValidationRule } from "../models/data-validation-rule.js";
import { NutrientIntakeRule } from "../models/nutrient-intake-rule.js";
import { NutritionTerminology } from "../models/nutrition-terminology.js";
import { ReferenceSource } from "../models/reference-source.js";
import { RiskAssessmentRule } from "../models/risk-assessment-rule.js";
import {
  conditionDietConditions,
  conditionDietRules,
  dataValidationRules,
  nutritionTerminology,
  referenceSources,
  riskAssessmentRules
} from "../data/referenceGuidelineSeeds.js";
import { wst578NutrientRules } from "../data/wst578NutrientRules.js";

const nutrientLabels: Record<string, string> = {
  addedSugar: "Added sugar",
  biotin: "Biotin",
  calcium: "Calcium",
  carbs: "Carbohydrate",
  chloride: "Chloride",
  choline: "Choline",
  chromium: "Chromium",
  copper: "Copper",
  energyKcal: "Energy",
  fat: "Fat",
  folate: "Folate",
  iodine: "Iodine",
  iron: "Iron",
  magnesium: "Magnesium",
  molybdenum: "Molybdenum",
  niacin: "Niacin",
  niacinamide: "Niacinamide",
  omega3: "n-3 polyunsaturated fatty acid",
  omega6: "n-6 polyunsaturated fatty acid",
  pantothenicAcid: "Pantothenic acid",
  phosphorus: "Phosphorus",
  potassium: "Potassium",
  protein: "Protein",
  saturatedFat: "Saturated fat",
  selenium: "Selenium",
  sodium: "Sodium",
  vitaminA: "Vitamin A",
  vitaminB1: "Vitamin B1",
  vitaminB2: "Vitamin B2",
  vitaminB6: "Vitamin B6",
  vitaminB12: "Vitamin B12",
  vitaminC: "Vitamin C",
  vitaminD: "Vitamin D",
  vitaminE: "Vitamin E",
  vitaminK: "Vitamin K",
  zinc: "Zinc"
};

function normalizeWst578Rule(rule: Record<string, unknown>) {
  const ageGroup = String(rule.ageGroup || "");
  const normalized: Record<string, unknown> = {
    ...rule,
    nutrientLabel: nutrientLabels[String(rule.nutrientKey)] || String(rule.nutrientLabel || rule.nutrientKey || ""),
    doctor_verified: true
  };

  if (ageGroup.includes("\u5b55\u5987")) {
    normalized.gender = "female";
    normalized.populationGroup = "pregnant";
    normalized.ageMin = undefined;
    normalized.ageMax = undefined;

    if (ageGroup.includes("1") && ageGroup.includes("12")) {
      normalized.lifeStage = "pregnancy_early";
    } else if (ageGroup.includes("13") || ageGroup.includes("27")) {
      normalized.lifeStage = "pregnancy_mid";
    } else if (ageGroup.includes("28")) {
      normalized.lifeStage = "pregnancy_late";
    } else {
      normalized.lifeStage = "pregnancy";
    }
  }

  if (ageGroup.includes("\u4e73\u6bcd")) {
    normalized.gender = "female";
    normalized.populationGroup = "lactating";
    normalized.lifeStage = "lactation";
    normalized.ageMin = undefined;
    normalized.ageMax = undefined;
  }

  return normalized;
}

async function replaceMany(model: mongoose.Model<any>, filter: Record<string, unknown>, docs: readonly Record<string, unknown>[], label: string) {
  const deleted = await model.deleteMany(filter);
  if (docs.length) {
    await model.insertMany(docs, { ordered: false });
  }
  console.log(`${label}: deleted ${deleted.deletedCount}, inserted ${docs.length}`);
}

await connectDatabase();

await replaceMany(
  ReferenceSource,
  {
    dataSource: {
      $in: [
        "Chinese Dietary Reference Intakes WST578",
        "Chinese national food therapy and diet guidelines",
        "Chinese WS/T health assessment standards",
        "Chinese WS/T nutrition terminology and food composition standards",
        "WHO Growth Reference 2007"
      ]
    }
  },
  referenceSources.map((source) => ({
    ...source,
    sourceRefs: [source.filePath],
    doctor_verified: true
  })),
  "referenceSources"
);

await replaceMany(
  NutrientIntakeRule,
  { dataSource: /^Chinese Dietary Reference Intakes WST578/ },
  wst578NutrientRules.map((rule) => normalizeWst578Rule(rule)),
  "nutrientIntakeRules"
);

await replaceMany(
  ConditionDietCondition,
  { dataSource: "Chinese national food therapy and diet guidelines" },
  conditionDietConditions,
  "conditionDietConditions"
);

await replaceMany(
  ConditionDietRule,
  { dataSource: "Chinese national food therapy and diet guidelines" },
  conditionDietRules,
  "conditionDietRules"
);

await replaceMany(
  RiskAssessmentRule,
  { dataSource: { $in: ["Chinese WS/T health assessment standards", "WHO Growth Reference 2007"] } },
  riskAssessmentRules,
  "riskAssessmentRules"
);

await replaceMany(
  NutritionTerminology,
  { dataSource: "Chinese WS/T nutrition terminology and food composition standards" },
  nutritionTerminology,
  "nutritionTerminology"
);

await replaceMany(
  DataValidationRule,
  { dataSource: "Chinese WS/T nutrition terminology and food composition standards" },
  dataValidationRules,
  "dataValidationRules"
);

await mongoose.disconnect();

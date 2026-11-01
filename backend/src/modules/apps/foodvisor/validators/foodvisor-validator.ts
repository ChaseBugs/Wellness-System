import { body, param, query } from "express-validator";
import { MEAL_TYPES } from "../models/meal-log.js";

export const idValidation = [param("id").isUUID()];

export const searchFoodsValidation = [
  query("q").optional().isString().isLength({ max: 120 }),
  query("category").optional().isString().isLength({ max: 80 }),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 })
];

export const barcodeValidation = [param("barcode").isString().matches(/^[0-9A-Za-z-]{4,64}$/)];

export const listMealLogsValidation = [
  query("from").optional().isISO8601(),
  query("to").optional().isISO8601(),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 })
];

export const createMealLogValidation = [
  body("eatenAt").isISO8601(),
  body("mealType").isIn(MEAL_TYPES),
  body("source").optional().isIn(["manual", "search", "photo", "barcode", "voice", "favorite"]),
  body("photoUrl").optional().isString().isLength({ max: 1000 }),
  body("notes").optional().isString().isLength({ max: 1000 }),
  body("items").optional().isArray({ max: 50 }),
  body("items.*.foodId").optional().isUUID(),
  body("items.*.quantityG").optional().isFloat({ gt: 0, max: 5000 }),
  body("items.*.name").optional().isString().trim().isLength({ min: 1, max: 200 }),
  body("items.*.calories").optional().isFloat({ min: 0, max: 10000 }),
  body("items.*.proteinG").optional().isFloat({ min: 0, max: 1000 }),
  body("items.*.carbsG").optional().isFloat({ min: 0, max: 1000 }),
  body("items.*.fatG").optional().isFloat({ min: 0, max: 1000 }),
  body("recipe").optional().isObject(),
  body("recipe.contentId").if(body("recipe").exists()).isUUID(),
  body("recipe.servings").if(body("recipe").exists()).isFloat({ gt: 0, max: 20 })
];

export const upsertNutritionGoalValidation = [
  body("goalType").isIn(["lose", "maintain", "gain", "custom"]),
  body("calories").isInt({ min: 800, max: 6000 }),
  body("proteinG").optional({ values: "null" }).isInt({ min: 0, max: 500 }),
  body("carbsG").optional({ values: "null" }).isInt({ min: 0, max: 1000 }),
  body("fatG").optional({ values: "null" }).isInt({ min: 0, max: 500 })
];

export const dailySummaryValidation = [
  query("date").isISO8601({ strict: true }).isLength({ min: 10, max: 10 }),
  query("timezone").optional().isString().isLength({ max: 64 })
];

const PROFILE_GENDERS = ["male", "female", "non_binary"];
const ACTIVITY_LEVELS = ["sedentary", "low_active", "active", "very_active"];

export const healthMetricsValidation = [
  body("gender").isIn(PROFILE_GENDERS),
  body("age").isFloat({ min: 1, max: 120 }),
  body("heightCm").isFloat({ min: 40, max: 260 }),
  body("weightKg").isFloat({ min: 2, max: 400 }),
  body("activityLevel").optional().isIn(ACTIVITY_LEVELS),
  body("goal").optional().isIn(["lose_weight", "maintain_weight", "gain_weight"]),
  body("dailyActivityCalories").optional().isFloat({ min: 0, max: 10000 }),
  body("calorieAdjustment").optional().isFloat({ min: -2000, max: 2000 }),
  body("macroRatios").optional().isObject(),
  body("activities").optional().isArray({ max: 50 }),
  body("activities.*.metValue").isFloat({ gt: 0, max: 30 }),
  body("activities.*.durationMinutes").isFloat({ gt: 0, max: 1440 })
];

const targetProfileFields = (location: typeof body | typeof query) => [
  location("age").isFloat({ min: 0, max: 120 }),
  location("gender").optional().isIn(["male", "female", "all", "non_binary"]),
  location("lifeStage").optional().isString().isLength({ max: 40 }),
  location("populationGroup").optional().isString().isLength({ max: 40 }),
  location("physicalActivityLevel").optional().isIn(["rest", "light", "moderate", "heavy"]),
  location("pal").optional().isIn(["rest", "light", "moderate", "heavy"])
];

export const dailyTargetsQueryValidation = targetProfileFields(query);
export const dailyTargetsBodyValidation = targetProfileFields(body);

export const optimizeDietValidation = [
  body("profileKey").optional().isString().isLength({ max: 80 }),
  body("targetProfile").optional().isObject(),
  body("targetProfile.age").if(body("targetProfile").exists()).isFloat({ min: 0, max: 120 }),
  body("dataSource").optional().isString().isLength({ max: 120 }),
  body("candidateLimit").optional().isInt({ min: 50, max: 6000 }),
  body("poolLimit").optional().isInt({ min: 100, max: 50000 }),
  body("maxServingsPerFood").optional().isFloat({ min: 0.25, max: 50 }),
  body("topPerNutrient").optional().isInt({ min: 10, max: 300 }),
  body(["includeCategories", "excludeCategories", "excludeTerms"]).optional().isArray({ max: 100 }),
  body("constraints").optional().isArray({ max: 100 }),
  body("constraints.*.nutrientKey").isString().isLength({ min: 1, max: 60 })
];

export const analyzeIntakeValidation = [
  query("from").optional().isISO8601(),
  query("to").optional().isISO8601(),
  query("age").optional().isFloat({ min: 0, max: 120 }),
  query("gender").optional().isIn(["male", "female", "all"])
];

export const upsertProfileValidation = [
  body("goal").optional({ values: "null" }).isString().isLength({ max: 80 }),
  body("gender").optional({ values: "null" }).isIn(PROFILE_GENDERS),
  body("age").optional({ values: "null" }).isInt({ min: 13, max: 120 }),
  body("heightCm").optional({ values: "null" }).isFloat({ min: 50, max: 260 }),
  body("currentWeightKg").optional({ values: "null" }).isFloat({ min: 20, max: 400 }),
  body("targetWeightKg").optional({ values: "null" }).isFloat({ min: 20, max: 400 }),
  body("activityLevel").optional({ values: "null" }).isIn(ACTIVITY_LEVELS),
  body(["dietaryRestrictions", "medicalConditions"]).optional().isArray({ max: 30 }),
  body(["dietaryRestrictions.*", "medicalConditions.*"]).isString().isLength({ min: 1, max: 80 }),
  body("programStage").optional().isString().isLength({ max: 40 })
];

export const recordWeightValidation = [
  body("measuredOn").isISO8601({ strict: true }).isLength({ min: 10, max: 10 }),
  body("weightKg").isFloat({ min: 20, max: 400 }),
  body("note").optional({ values: "null" }).isString().isLength({ max: 500 })
];

export const classifySurveyValidation = [
  body("answers").isArray({ min: 1, max: 100 }),
  body("answers.*.questionId").isString().isLength({ min: 1, max: 80 }),
  body("answers.*.value").exists(),
  body("notes").optional().isString().isLength({ max: 1000 })
];

import { body, param, query } from "express-validator";
import { DIFFICULTIES } from "../../../platform/content/models/content-item.js";
import { MEAL_TYPES } from "../models/meal-plan.js";

export const idValidation = [param("id").isUUID()];
export const contentIdValidation = [param("contentId").isUUID()];

export const listRecipesValidation = [
  query("q").optional().isString().isLength({ max: 200 }),
  query("difficulty").optional().isIn(DIFFICULTIES),
  query("maxMinutes").optional().isInt({ min: 0, max: 1440 }),
  query("excludeAllergens").optional().isString().isLength({ max: 300 }),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 })
];

export const createMealPlanValidation = [
  body("title").isString().trim().isLength({ min: 1, max: 120 }),
  body("startDate").isISO8601({ strict: true }).isLength({ min: 10, max: 10 }),
  body("items").isArray({ min: 1, max: 60 }),
  body("items.*.dayIndex").isInt({ min: 0, max: 6 }),
  body("items.*.mealType").isIn(MEAL_TYPES),
  body("items.*.contentId").isUUID(),
  body("items.*.servings").optional().isFloat({ gt: 0, max: 20 })
];

import { body } from "express-validator";

export const calculateHealthMetricsValidation = [
  body("gender").isIn(["male", "female", "non_binary"]),
  body("age").isNumeric(),
  body("heightCm").isNumeric(),
  body("weightKg").isNumeric(),
  body("activityLevel").optional().isString(),
  body("goal").optional().isString(),
  body("dailyActivityCalories").optional().isNumeric(),
  body("calorieAdjustment").optional().isNumeric(),
  body("macroRatios").optional().isObject(),
  body("activities").optional().isArray()
];

import { body, param } from "express-validator";
import { APP_CODES } from "../../../../config/app-catalog.js";

export const updateUserValidation = [
  body("displayName").optional({ values: "null" }).isString().trim().isLength({ min: 1, max: 80 }),
  body("locale").optional().isString().isLength({ min: 2, max: 16 }),
  body("country").optional({ values: "null" }).isISO31661Alpha2(),
  body("timezone").optional().isString().isLength({ max: 64 }),
  body("marketingOptIn").optional().isBoolean({ strict: true }),
  body("crossAppRecommendations").optional().isBoolean({ strict: true })
];

export const appCodeParamValidation = [param("appCode").isIn(APP_CODES)];

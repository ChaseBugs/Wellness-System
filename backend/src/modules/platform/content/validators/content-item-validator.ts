import { body, param, query } from "express-validator";
import { APP_CODES } from "../../../../config/app-catalog.js";
import { CONTENT_TYPES, DIFFICULTIES, REVIEW_STATUSES } from "../models/content-item.js";

const sharedFieldRules = (optionalAll: boolean) => {
  const field = (name: string) => (optionalAll ? body(name).optional() : body(name));
  return [
    field("title").isString().trim().isLength({ min: 1, max: 200 }),
    field("appCodes").isArray({ min: 1, max: 25 }),
    body("appCodes.*").isIn(APP_CODES),
    body("summary").optional({ values: "null" }).isString().isLength({ max: 1000 }),
    body("body").optional({ values: "null" }).isString().isLength({ max: 50000 }),
    body("category").optional({ values: "null" }).isString().isLength({ max: 80 }),
    body("tags").optional().isArray({ max: 30 }),
    body("tags.*").isString().isLength({ min: 1, max: 40 }),
    body("durationMinutes").optional({ values: "null" }).isInt({ min: 0, max: 1440 }),
    body("difficulty").optional({ values: "null" }).isIn(DIFFICULTIES),
    body("steps").optional().isArray({ max: 100 }),
    body("steps.*.text").isString().isLength({ min: 1, max: 2000 }),
    body("media").optional().isObject(),
    body("attributes").optional().isObject(),
    body("locale").optional().isString().isLength({ min: 2, max: 16 }),
    body("isPremium").optional().isBoolean({ strict: true })
  ];
};

export const createContentValidation = [body("contentType").isIn(CONTENT_TYPES), ...sharedFieldRules(false)];

export const updateContentValidation = [param("id").isUUID(), ...sharedFieldRules(true)];

export const contentIdValidation = [param("id").isUUID()];

export const reviewContentValidation = [
  param("id").isUUID(),
  body("approve").isBoolean({ strict: true }),
  body("notes").optional().isString().isLength({ max: 2000 })
];

export const listContentValidation = [
  query("app").optional().isIn(APP_CODES),
  query("type").optional().isIn(CONTENT_TYPES),
  query("difficulty").optional().isIn(DIFFICULTIES),
  query("status").optional().isIn(REVIEW_STATUSES),
  query("maxMinutes").optional().isInt({ min: 0 }),
  query("q").optional().isString().isLength({ max: 200 }),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 })
];

import { body, param, query } from "express-validator";
import { APP_CODES } from "../../../../config/app-catalog.js";
import { INTERACTION_ACTIONS } from "../models/recommendation.js";

export const feedValidation = [query("limit").optional().isInt({ min: 1, max: 3 })];

export const trackInteractionValidation = [param("ruleId").isUUID(), body("action").isIn(INTERACTION_ACTIONS)];

export const statsValidation = [
  query("from").isISO8601({ strict: true }).isLength({ min: 10, max: 10 }),
  query("to").isISO8601({ strict: true }).isLength({ min: 10, max: 10 })
];

const ruleFields = (partial: boolean) => [
  (partial ? body("triggerEvent").optional() : body("triggerEvent")).isString().matches(/^[a-z][a-z0-9_]{1,63}$/),
  (partial ? body("headline").optional() : body("headline")).isString().trim().isLength({ min: 1, max: 140 }),
  body("lookbackDays").optional().isInt({ min: 1, max: 90 }),
  body("body").optional({ values: "null" }).isString().isLength({ max: 500 }),
  body("deepLink").optional({ values: "null" }).isString().isLength({ max: 500 }),
  body("priority").optional().isInt({ min: 0, max: 10000 }),
  body("maxImpressionsPerWeek").optional().isInt({ min: 1, max: 50 }),
  body("isActive").optional().isBoolean({ strict: true })
];

export const createRuleValidation = [
  body("code").isString().matches(/^[a-z0-9][a-z0-9_-]{2,79}$/),
  body("sourceApp").isIn(APP_CODES),
  body("targetApp").isIn(APP_CODES),
  ...ruleFields(false)
];

export const updateRuleValidation = [param("id").isUUID(), ...ruleFields(true)];

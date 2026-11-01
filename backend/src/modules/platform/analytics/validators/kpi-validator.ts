import { query } from "express-validator";
import { APP_CODES } from "../../../../config/app-catalog.js";

export const kpiSummaryValidation = [
  query("app").isIn(APP_CODES),
  query("from").isISO8601({ strict: true }).isLength({ min: 10, max: 10 }),
  query("to").isISO8601({ strict: true }).isLength({ min: 10, max: 10 })
];

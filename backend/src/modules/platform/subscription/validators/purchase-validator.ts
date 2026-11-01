import { body, param, query } from "express-validator";
import { APP_CODES } from "../../../../config/app-catalog.js";

const STORES = ["apple", "google", "dev"];

export const verifyPurchaseValidation = [
  body("store").isIn(STORES),
  body("productId").isString().isLength({ min: 1, max: 200 }),
  body("purchaseToken").isString().isLength({ min: 1, max: 20000 })
];

export const restorePurchasesValidation = [
  body("purchases").isArray({ min: 1, max: 50 }),
  body("purchases.*.store").isIn(STORES),
  body("purchases.*.productId").isString().isLength({ min: 1, max: 200 }),
  body("purchases.*.purchaseToken").isString().isLength({ min: 1, max: 20000 })
];

export const webhookValidation = [param("store").isIn(STORES)];

export const listPlansValidation = [query("app").optional().isIn(APP_CODES)];

export const eligibilityValidation = [query("planCode").isString().isLength({ min: 1, max: 100 })];

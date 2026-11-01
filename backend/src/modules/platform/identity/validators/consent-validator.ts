import { body, param } from "express-validator";
import { APP_CODES } from "../../../../config/app-catalog.js";
import { CONSENT_SCOPES } from "../models/consent.js";

export const createConsentValidation = [
  body("sourceApp").isIn(APP_CODES),
  body("targetApp").isIn(APP_CODES),
  body("scope").isIn(CONSENT_SCOPES)
];

export const consentIdValidation = [param("id").isUUID()];

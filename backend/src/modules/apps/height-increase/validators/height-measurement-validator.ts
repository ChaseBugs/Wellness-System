import { body, param } from "express-validator";

export const recordMeasurementValidation = [
  body("measuredOn").isISO8601({ strict: true }).isLength({ min: 10, max: 10 }),
  body("heightCm").isFloat({ min: 40, max: 250 }),
  body("weightKg").optional({ values: "null" }).isFloat({ min: 2, max: 300 }),
  body("notes").optional({ values: "null" }).isString().isLength({ max: 1000 })
];

export const measurementIdValidation = [param("id").isUUID()];

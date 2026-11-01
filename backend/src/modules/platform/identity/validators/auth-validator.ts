import { body } from "express-validator";

export const registerValidation = [
  body("email").isEmail().isLength({ max: 254 }),
  body("password").isString().isLength({ min: 8, max: 128 }),
  body("displayName").optional().isString().trim().isLength({ min: 1, max: 80 }),
  body("locale").optional().isString().isLength({ min: 2, max: 16 }),
  body("country").optional().isISO31661Alpha2(),
  body("timezone").optional().isString().isLength({ max: 64 })
];

export const loginValidation = [body("email").isEmail(), body("password").isString().notEmpty()];

export const refreshValidation = [body("refreshToken").isString().isLength({ min: 20, max: 200 })];

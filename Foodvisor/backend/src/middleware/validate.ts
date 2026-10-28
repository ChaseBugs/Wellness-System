import type { NextFunction, Request, Response } from "express";
import { validationResult, type ValidationChain } from "express-validator";
import { ValidationError } from "../utils/errors.js";

export function validate(chains: ValidationChain[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    await Promise.all(chains.map((chain) => chain.run(req)));

    const result = validationResult(req);
    if (!result.isEmpty()) {
      next(new ValidationError("Request validation failed", result.array()));
      return;
    }

    next();
  };
}

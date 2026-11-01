import type { NextFunction, Request, Response } from "express";
import { isAppCode, type AppCode } from "../config/app-catalog.js";
import { ValidationError } from "../utils/errors.js";

/**
 * Platform endpoints (analytics, recommendations, reminders, auth) are shared by every app, so the
 * calling app identifies itself with the `X-App-Code` header.
 */
export function readAppContext(required: boolean) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.get("x-app-code");
    if (header === undefined || header === "") {
      if (required) next(new ValidationError("X-App-Code header is required"));
      else next();
      return;
    }
    if (!isAppCode(header)) {
      next(new ValidationError(`Unknown app code: ${header}`));
      return;
    }
    req.appCode = header;
    next();
  };
}

export const requireAppContext = readAppContext(true);
export const optionalAppContext = readAppContext(false);

/** App modules know their own identity from the mount path, so no header is needed there. */
export function fixedAppContext(appCode: AppCode) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.appCode = appCode;
    next();
  };
}

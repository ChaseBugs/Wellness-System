import type { NextFunction, Request, Response } from "express";
import type { AppCode } from "../config/app-catalog.js";
import type { EntitlementChecker } from "../modules/platform/subscription/domain/entitlement-checker.js";
import { EntitlementRequiredError, UnauthorizedError } from "../utils/errors.js";

/**
 * Guards premium endpoints. Access is granted by an App Pro plan for `appCode` or by a
 * Wellness Pass that lists the app, whichever app the purchase was made in.
 */
export function requireEntitlement(checker: EntitlementChecker, appCode: AppCode) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const allowed = await checker.hasAccess(req.user.id, appCode);
      if (!allowed) throw new EntitlementRequiredError(appCode);
      next();
    } catch (error) {
      next(error);
    }
  };
}

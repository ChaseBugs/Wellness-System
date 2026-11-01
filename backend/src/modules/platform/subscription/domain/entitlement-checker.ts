import type { AppCode } from "../../../../config/app-catalog.js";

/** Narrow port other modules depend on to gate premium features. */
export interface EntitlementChecker {
  hasAccess(userId: string, appCode: AppCode): Promise<boolean>;
}

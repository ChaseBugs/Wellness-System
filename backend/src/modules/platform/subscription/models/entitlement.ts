import type { AppCode } from "../../../../config/app-catalog.js";
import type { PlanTier } from "./plan.js";

/** One app unlocked by one active purchase. */
export interface EntitlementGrant {
  appCode: AppCode;
  tier: PlanTier;
  planCode: string;
  expiresAt: Date | null;
  purchaseId: string;
}

export interface EntitlementSummaryResponse {
  tier: "free" | PlanTier;
  apps: Array<{ appCode: AppCode; tier: PlanTier; planCode: string; expiresAt: Date | null }>;
}

export interface EligibilityResponse {
  planCode: string;
  eligible: boolean;
  reason: "ELIGIBLE" | "ALREADY_ENTITLED" | "UPGRADE";
  alreadyCoveredApps: AppCode[];
}

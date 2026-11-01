import type { AppCode } from "../../../../config/app-catalog.js";

/**
 * What a target app may read from a source app. Kept deliberately coarse and summary-level:
 * raw records (child growth logs, individual meals) are never exposed through a consent.
 */
export const CONSENT_SCOPES = ["goals", "activity_summary", "nutrition_summary", "growth_summary"] as const;
export type ConsentScope = (typeof CONSENT_SCOPES)[number];

export interface Consent {
  id: string;
  userId: string;
  sourceApp: AppCode;
  targetApp: AppCode;
  scope: ConsentScope;
  grantedAt: Date;
  revokedAt: Date | null;
}

export interface CreateConsentInput {
  sourceApp: AppCode;
  targetApp: AppCode;
  scope: ConsentScope;
}

export interface ConsentResponse {
  id: string;
  sourceApp: AppCode;
  targetApp: AppCode;
  scope: ConsentScope;
  grantedAt: Date;
}

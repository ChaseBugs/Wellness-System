import type { AppCode } from "../../../../config/app-catalog.js";

export const INTERACTION_ACTIONS = ["impression", "click", "dismiss", "install"] as const;
export type InteractionAction = (typeof INTERACTION_ACTIONS)[number];

export interface RuleUserState {
  ruleId: string;
  impressionsLast7Days: number;
  dismissedLast30Days: boolean;
}

export interface RecommendationResponse {
  ruleId: string;
  targetApp: { code: AppCode; name: string };
  headline: string;
  body: string | null;
  deepLink: string | null;
}

export interface RuleStatsResponse {
  ruleId: string;
  code: string;
  sourceApp: AppCode;
  targetApp: AppCode;
  impressions: number;
  clicks: number;
  dismissals: number;
  installs: number;
  clickThroughRate: number;
  installRate: number;
}

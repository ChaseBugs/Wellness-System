import type { AppCode } from "../../../../config/app-catalog.js";

export interface RecommendationRule {
  id: string;
  code: string;
  sourceApp: AppCode;
  targetApp: AppCode;
  triggerEvent: string;
  lookbackDays: number;
  headline: string;
  body: string | null;
  deepLink: string | null;
  priority: number;
  maxImpressionsPerWeek: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRecommendationRuleInput {
  code: string;
  sourceApp: AppCode;
  targetApp: AppCode;
  triggerEvent: string;
  lookbackDays?: number;
  headline: string;
  body?: string;
  deepLink?: string;
  priority?: number;
  maxImpressionsPerWeek?: number;
  isActive?: boolean;
}

export type UpdateRecommendationRuleInput = Partial<Omit<CreateRecommendationRuleInput, "code" | "sourceApp" | "targetApp">>;

export type RecommendationRuleResponse = Omit<RecommendationRule, "createdAt">;

import type { AppCode } from "../../../../config/app-catalog.js";

export type Store = "apple" | "google" | "dev";
export type PlanTier = "app_pro" | "wellness_pass";
export type BillingPeriod = "monthly" | "yearly";

export interface Plan {
  id: string;
  code: string;
  name: string;
  tier: PlanTier;
  appCode: AppCode | null;
  billingPeriod: BillingPeriod;
  priceUsd: number;
  isActive: boolean;
  apps: AppCode[];
  products: Array<{ store: Store; productId: string }>;
}

export interface PlanResponse {
  code: string;
  name: string;
  tier: PlanTier;
  appCode: AppCode | null;
  billingPeriod: BillingPeriod;
  priceUsd: number;
  unlocksApps: AppCode[];
  products: Array<{ store: Store; productId: string }>;
}

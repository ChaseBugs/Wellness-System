import type { AppCode } from "../../../../config/app-catalog.js";
import type { EntitlementSummaryResponse } from "./entitlement.js";
import type { Store } from "./plan.js";

export type PurchaseStatus = "active" | "grace_period" | "expired" | "refunded" | "revoked" | "cancelled";

export interface Purchase {
  id: string;
  userId: string;
  planId: string;
  store: Store;
  productId: string;
  originalTransactionId: string;
  latestTransactionId: string | null;
  purchasedInApp: AppCode | null;
  status: PurchaseStatus;
  autoRenew: boolean;
  startedAt: Date;
  expiresAt: Date | null;
  lastVerifiedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavePurchaseInput {
  userId: string;
  planId: string;
  store: Store;
  productId: string;
  originalTransactionId: string;
  latestTransactionId: string | null;
  purchasedInApp: AppCode | null;
  status: PurchaseStatus;
  autoRenew: boolean;
  startedAt: Date;
  expiresAt: Date | null;
}

/** What the client sends after a store purchase: the receipt (Apple) or purchase token (Google). */
export interface VerifyPurchaseInput {
  store: Store;
  productId: string;
  purchaseToken: string;
}

/** Normalised result of asking the store about a purchase. */
export interface StoreVerification {
  productId: string;
  originalTransactionId: string;
  latestTransactionId: string | null;
  status: PurchaseStatus;
  autoRenew: boolean;
  startedAt: Date;
  expiresAt: Date | null;
}

/** Normalised server-to-server notification (renewal, refund, expiry, plan change). */
export interface StoreNotification {
  eventType: string;
  originalTransactionId: string;
  status: PurchaseStatus;
  expiresAt?: Date | null;
  autoRenew?: boolean;
}

export interface PurchaseResponse {
  id: string;
  planId: string;
  store: Store;
  productId: string;
  purchasedInApp: AppCode | null;
  status: PurchaseStatus;
  autoRenew: boolean;
  startedAt: Date;
  expiresAt: Date | null;
}

export interface VerifyPurchaseResponse {
  purchase: PurchaseResponse;
  /** True when every app this plan unlocks was already covered by another active purchase. */
  duplicate: boolean;
  entitlements: EntitlementSummaryResponse;
}

export interface RestoreResult {
  restored: PurchaseResponse[];
  failed: Array<{ productId: string; code: string; message: string }>;
  entitlements: EntitlementSummaryResponse;
}

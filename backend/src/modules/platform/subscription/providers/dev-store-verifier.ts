import type { IStoreVerifier } from "../domain/IStoreVerifier.js";
import type { Plan } from "../models/plan.js";
import type { PurchaseStatus, StoreNotification, StoreVerification, VerifyPurchaseInput } from "../models/purchase.js";
import { ValidationError } from "../../../../utils/errors.js";

const NOTIFICATION_STATUS: Record<string, PurchaseStatus> = {
  RENEWED: "active",
  GRACE_PERIOD: "grace_period",
  EXPIRED: "expired",
  REFUNDED: "refunded",
  REVOKED: "revoked",
  CANCELLED: "cancelled"
};

/**
 * Local-development store: trusts the client and treats `purchaseToken` as the transaction id.
 * Registered only when env.devStoreEnabled (never in production), so mobile builds can exercise
 * the full purchase -> entitlement -> restore flow without App Store / Play sandbox accounts.
 */
export class DevStoreVerifier implements IStoreVerifier {
  readonly store = "dev" as const;

  async verify(input: VerifyPurchaseInput, plan: Plan): Promise<StoreVerification> {
    const now = new Date();
    const days = plan.billingPeriod === "yearly" ? 365 : 30;
    return {
      productId: input.productId,
      originalTransactionId: input.purchaseToken,
      latestTransactionId: input.purchaseToken,
      status: "active",
      autoRenew: true,
      startedAt: now,
      expiresAt: new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    };
  }

  async parseNotification(body: unknown): Promise<StoreNotification> {
    const payload = body as { originalTransactionId?: unknown; type?: unknown; expiresAt?: unknown };
    const type = typeof payload.type === "string" ? payload.type.toUpperCase() : "";
    if (typeof payload.originalTransactionId !== "string" || !NOTIFICATION_STATUS[type]) {
      throw new ValidationError("Dev notification needs originalTransactionId and a known type", {
        types: Object.keys(NOTIFICATION_STATUS)
      });
    }
    return {
      eventType: type,
      originalTransactionId: payload.originalTransactionId,
      status: NOTIFICATION_STATUS[type],
      expiresAt: typeof payload.expiresAt === "string" ? new Date(payload.expiresAt) : undefined,
      autoRenew: type === "CANCELLED" ? false : undefined
    };
  }
}

import type { AppCode } from "../../../../config/app-catalog.js";
import type { EntitlementGrant } from "../models/entitlement.js";
import type { Store } from "../models/plan.js";
import type { Purchase, PurchaseStatus, SavePurchaseInput } from "../models/purchase.js";

export interface IPurchaseRepository {
  findByStoreTransaction(store: Store, originalTransactionId: string): Promise<Purchase | null>;
  listForUser(userId: string): Promise<Purchase[]>;
  /**
   * Inserts or refreshes the purchase and appends an audit event in one transaction.
   * Returns null when the store transaction is already linked to a different account.
   */
  saveVerification(input: SavePurchaseInput, eventType: string, payload: Record<string, unknown>): Promise<Purchase | null>;
  applyStatus(
    purchaseId: string,
    status: PurchaseStatus,
    changes: { expiresAt?: Date | null; autoRenew?: boolean },
    eventType: string,
    payload: Record<string, unknown>
  ): Promise<Purchase>;
  findActiveGrants(userId: string): Promise<EntitlementGrant[]>;
  hasActiveGrant(userId: string, appCode: AppCode): Promise<boolean>;
}

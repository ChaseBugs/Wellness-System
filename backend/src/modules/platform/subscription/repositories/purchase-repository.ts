import type pg from "pg";
import type { AppCode } from "../../../../config/app-catalog.js";
import { camelizeRow, camelizeRows, withTransaction } from "../../../../utils/sql.js";
import type { IPurchaseRepository } from "../domain/IPurchaseRepository.js";
import type { EntitlementGrant } from "../models/entitlement.js";
import type { Store } from "../models/plan.js";
import type { Purchase, PurchaseStatus, SavePurchaseInput } from "../models/purchase.js";

// A purchase grants access while active or in the store's billing-retry grace period and not past expiry.
const ACTIVE_GRANTS = `
  FROM billing.purchases pu
  JOIN billing.plans p ON p.id = pu.plan_id
  JOIN billing.plan_apps pa ON pa.plan_id = p.id
  WHERE pu.user_id = $1
    AND pu.status IN ('active', 'grace_period')
    AND (pu.expires_at IS NULL OR pu.expires_at > now())`;

export class PurchaseRepository implements IPurchaseRepository {
  constructor(private pool: pg.Pool) {}

  async findByStoreTransaction(store: Store, originalTransactionId: string): Promise<Purchase | null> {
    const result = await this.pool.query(
      "SELECT * FROM billing.purchases WHERE store = $1 AND original_transaction_id = $2",
      [store, originalTransactionId]
    );
    return result.rows[0] ? camelizeRow<Purchase>(result.rows[0]) : null;
  }

  async listForUser(userId: string): Promise<Purchase[]> {
    const result = await this.pool.query(
      "SELECT * FROM billing.purchases WHERE user_id = $1 ORDER BY started_at DESC",
      [userId]
    );
    return camelizeRows<Purchase>(result.rows);
  }

  async saveVerification(
    input: SavePurchaseInput,
    eventType: string,
    payload: Record<string, unknown>
  ): Promise<Purchase | null> {
    return withTransaction(this.pool, async (client) => {
      const result = await client.query(
        `INSERT INTO billing.purchases (
           user_id, plan_id, store, product_id, original_transaction_id, latest_transaction_id,
           purchased_in_app, status, auto_renew, started_at, expires_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (store, original_transaction_id) DO UPDATE SET
           plan_id = EXCLUDED.plan_id,
           product_id = EXCLUDED.product_id,
           latest_transaction_id = EXCLUDED.latest_transaction_id,
           status = EXCLUDED.status,
           auto_renew = EXCLUDED.auto_renew,
           expires_at = EXCLUDED.expires_at,
           last_verified_at = now(),
           updated_at = now()
         WHERE billing.purchases.user_id = EXCLUDED.user_id
         RETURNING *`,
        [
          input.userId,
          input.planId,
          input.store,
          input.productId,
          input.originalTransactionId,
          input.latestTransactionId,
          input.purchasedInApp,
          input.status,
          input.autoRenew,
          input.startedAt,
          input.expiresAt
        ]
      );
      // The WHERE guard leaves another account's purchase untouched; returning null lets the service
      // report the conflict instead of silently re-assigning the subscription.
      if (!result.rows[0]) return null;
      const purchase = camelizeRow<Purchase>(result.rows[0]);
      await client.query(
        "INSERT INTO billing.purchase_events (purchase_id, event_type, status, payload) VALUES ($1, $2, $3, $4)",
        [purchase.id, eventType, purchase.status, JSON.stringify(payload)]
      );
      return purchase;
    });
  }

  async applyStatus(
    purchaseId: string,
    status: PurchaseStatus,
    changes: { expiresAt?: Date | null; autoRenew?: boolean },
    eventType: string,
    payload: Record<string, unknown>
  ): Promise<Purchase> {
    return withTransaction(this.pool, async (client) => {
      const result = await client.query(
        `UPDATE billing.purchases SET
           status = $2,
           expires_at = CASE WHEN $3::boolean THEN $4::timestamptz ELSE expires_at END,
           auto_renew = coalesce($5, auto_renew),
           last_verified_at = now(),
           updated_at = now()
         WHERE id = $1 RETURNING *`,
        [purchaseId, status, changes.expiresAt !== undefined, changes.expiresAt ?? null, changes.autoRenew ?? null]
      );
      const purchase = camelizeRow<Purchase>(result.rows[0]);
      await client.query(
        "INSERT INTO billing.purchase_events (purchase_id, event_type, status, payload) VALUES ($1, $2, $3, $4)",
        [purchase.id, eventType, status, JSON.stringify(payload)]
      );
      return purchase;
    });
  }

  async findActiveGrants(userId: string): Promise<EntitlementGrant[]> {
    const result = await this.pool.query(
      `SELECT pa.app_code, p.tier, p.code AS plan_code, pu.expires_at, pu.id AS purchase_id ${ACTIVE_GRANTS}
       ORDER BY pa.app_code`,
      [userId]
    );
    return camelizeRows<EntitlementGrant>(result.rows);
  }

  async hasActiveGrant(userId: string, appCode: AppCode): Promise<boolean> {
    const result = await this.pool.query(`SELECT 1 ${ACTIVE_GRANTS} AND pa.app_code = $2 LIMIT 1`, [userId, appCode]);
    return (result.rowCount ?? 0) > 0;
  }
}

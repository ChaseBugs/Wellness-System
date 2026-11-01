import type pg from "pg";
import type { AppCode } from "../../../../config/app-catalog.js";
import { camelizeRow, camelizeRows } from "../../../../utils/sql.js";
import type { IPlanRepository } from "../domain/IPlanRepository.js";
import type { Plan, Store } from "../models/plan.js";

const PLAN_SELECT = `
  SELECT p.*,
    COALESCE((SELECT array_agg(pa.app_code ORDER BY pa.app_code) FROM billing.plan_apps pa WHERE pa.plan_id = p.id), '{}') AS apps,
    COALESCE((SELECT json_agg(json_build_object('store', sp.store, 'productId', sp.product_id) ORDER BY sp.store)
              FROM billing.plan_store_products sp WHERE sp.plan_id = p.id), '[]'::json) AS products
  FROM billing.plans p`;

export class PlanRepository implements IPlanRepository {
  constructor(private pool: pg.Pool) {}

  async listActive(appCode?: AppCode): Promise<Plan[]> {
    const result = appCode
      ? await this.pool.query(
          `${PLAN_SELECT}
           WHERE p.is_active AND EXISTS (SELECT 1 FROM billing.plan_apps pa WHERE pa.plan_id = p.id AND pa.app_code = $1)
           ORDER BY p.tier, p.price_usd`,
          [appCode]
        )
      : await this.pool.query(`${PLAN_SELECT} WHERE p.is_active ORDER BY p.tier, p.app_code NULLS FIRST, p.price_usd`);
    return camelizeRows<Plan>(result.rows);
  }

  async findByCode(code: string): Promise<Plan | null> {
    const result = await this.pool.query(`${PLAN_SELECT} WHERE p.code = $1`, [code]);
    return result.rows[0] ? camelizeRow<Plan>(result.rows[0]) : null;
  }

  async findByStoreProduct(store: Store, productId: string): Promise<Plan | null> {
    const result = await this.pool.query(
      `${PLAN_SELECT}
       WHERE EXISTS (SELECT 1 FROM billing.plan_store_products sp WHERE sp.plan_id = p.id AND sp.store = $1 AND sp.product_id = $2)`,
      [store, productId]
    );
    return result.rows[0] ? camelizeRow<Plan>(result.rows[0]) : null;
  }
}

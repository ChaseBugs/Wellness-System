import type pg from "pg";
import type { AppCode } from "../../../../config/app-catalog.js";
import { camelizeRow, camelizeRows } from "../../../../utils/sql.js";
import type { IConsentRepository } from "../domain/IConsentRepository.js";
import type { Consent, CreateConsentInput } from "../models/consent.js";

export class ConsentRepository implements IConsentRepository {
  constructor(private pool: pg.Pool) {}

  async listActive(userId: string): Promise<Consent[]> {
    const result = await this.pool.query(
      "SELECT * FROM identity.consents WHERE user_id = $1 AND revoked_at IS NULL ORDER BY granted_at DESC",
      [userId]
    );
    return camelizeRows<Consent>(result.rows);
  }

  async findActive(userId: string, input: CreateConsentInput): Promise<Consent | null> {
    const result = await this.pool.query(
      `SELECT * FROM identity.consents
       WHERE user_id = $1 AND source_app = $2 AND target_app = $3 AND scope = $4 AND revoked_at IS NULL`,
      [userId, input.sourceApp, input.targetApp, input.scope]
    );
    return result.rows[0] ? camelizeRow<Consent>(result.rows[0]) : null;
  }

  async create(userId: string, input: CreateConsentInput): Promise<Consent> {
    const result = await this.pool.query(
      `INSERT INTO identity.consents (user_id, source_app, target_app, scope)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, input.sourceApp, input.targetApp, input.scope]
    );
    return camelizeRow<Consent>(result.rows[0]);
  }

  async revoke(id: string, userId: string): Promise<Consent | null> {
    const result = await this.pool.query(
      `UPDATE identity.consents SET revoked_at = now()
       WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL RETURNING *`,
      [id, userId]
    );
    return result.rows[0] ? camelizeRow<Consent>(result.rows[0]) : null;
  }

  async hasActive(userId: string, sourceApp: AppCode, targetApp: AppCode, scope: string): Promise<boolean> {
    const result = await this.pool.query(
      `SELECT 1 FROM identity.consents
       WHERE user_id = $1 AND source_app = $2 AND target_app = $3 AND scope = $4 AND revoked_at IS NULL`,
      [userId, sourceApp, targetApp, scope]
    );
    return (result.rowCount ?? 0) > 0;
  }
}

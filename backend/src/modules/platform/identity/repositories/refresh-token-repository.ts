import type pg from "pg";
import { camelizeRow } from "../../../../utils/sql.js";
import type { IRefreshTokenRepository } from "../domain/IRefreshTokenRepository.js";
import type { CreateRefreshTokenInput, RefreshToken } from "../models/auth.js";

export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private pool: pg.Pool) {}

  async create(input: CreateRefreshTokenInput): Promise<RefreshToken> {
    const result = await this.pool.query(
      `INSERT INTO identity.refresh_tokens (user_id, token_hash, app_code, expires_at)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [input.userId, input.tokenHash, input.appCode, input.expiresAt]
    );
    return camelizeRow<RefreshToken>(result.rows[0]);
  }

  async findByHash(tokenHash: string): Promise<RefreshToken | null> {
    const result = await this.pool.query("SELECT * FROM identity.refresh_tokens WHERE token_hash = $1", [tokenHash]);
    return result.rows[0] ? camelizeRow<RefreshToken>(result.rows[0]) : null;
  }

  async revoke(id: string, replacedBy?: string): Promise<void> {
    await this.pool.query(
      "UPDATE identity.refresh_tokens SET revoked_at = coalesce(revoked_at, now()), replaced_by = coalesce($2, replaced_by) WHERE id = $1",
      [id, replacedBy ?? null]
    );
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.pool.query(
      "UPDATE identity.refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL",
      [userId]
    );
  }
}

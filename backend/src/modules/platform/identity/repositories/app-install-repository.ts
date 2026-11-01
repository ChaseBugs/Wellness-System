import type pg from "pg";
import type { AppCode } from "../../../../config/app-catalog.js";
import { camelizeRows } from "../../../../utils/sql.js";
import type { IAppInstallRepository } from "../domain/IAppInstallRepository.js";
import type { AppInstall } from "../models/app.js";

export class AppInstallRepository implements IAppInstallRepository {
  constructor(private pool: pg.Pool) {}

  async touch(userId: string, appCode: AppCode): Promise<{ firstTime: boolean }> {
    // xmax = 0 only for freshly inserted rows, which tells us whether the upsert created the install.
    const result = await this.pool.query<{ inserted: boolean }>(
      `INSERT INTO identity.app_installs (user_id, app_code) VALUES ($1, $2)
       ON CONFLICT (user_id, app_code) DO UPDATE SET last_seen_at = now()
       RETURNING (xmax = 0) AS inserted`,
      [userId, appCode]
    );
    return { firstTime: Boolean(result.rows[0]?.inserted) };
  }

  async listForUser(userId: string): Promise<AppInstall[]> {
    const result = await this.pool.query(
      "SELECT * FROM identity.app_installs WHERE user_id = $1 ORDER BY last_seen_at DESC",
      [userId]
    );
    return camelizeRows<AppInstall>(result.rows);
  }

  async listCodes(userId: string): Promise<AppCode[]> {
    const result = await this.pool.query<{ app_code: AppCode }>(
      "SELECT app_code FROM identity.app_installs WHERE user_id = $1",
      [userId]
    );
    return result.rows.map((row) => row.app_code);
  }
}

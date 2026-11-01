import type pg from "pg";
import type { AppCode } from "../../../../config/app-catalog.js";
import { camelizeRow, camelizeRows } from "../../../../utils/sql.js";
import type { IDeviceRepository } from "../domain/IDeviceRepository.js";
import type { Device, RegisterDeviceInput } from "../models/device.js";

export class DeviceRepository implements IDeviceRepository {
  constructor(private pool: pg.Pool) {}

  async upsert(userId: string, appCode: AppCode, input: RegisterDeviceInput): Promise<Device> {
    const result = await this.pool.query(
      `INSERT INTO notify.devices (user_id, app_code, platform, push_token) VALUES ($1, $2, $3, $4)
       ON CONFLICT (push_token) DO UPDATE SET
         user_id = EXCLUDED.user_id, app_code = EXCLUDED.app_code, platform = EXCLUDED.platform,
         last_seen_at = now(), updated_at = now()
       RETURNING *`,
      [userId, appCode, input.platform, input.pushToken]
    );
    return camelizeRow<Device>(result.rows[0]);
  }

  async listForUser(userId: string, appCode: AppCode): Promise<Device[]> {
    const result = await this.pool.query(
      "SELECT * FROM notify.devices WHERE user_id = $1 AND app_code = $2 ORDER BY last_seen_at DESC",
      [userId, appCode]
    );
    return camelizeRows<Device>(result.rows);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.pool.query("DELETE FROM notify.devices WHERE id = $1 AND user_id = $2", [id, userId]);
    return (result.rowCount ?? 0) > 0;
  }
}

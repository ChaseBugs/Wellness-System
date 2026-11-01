import type pg from "pg";
import { camelizeRow, camelizeRows } from "../../../../utils/sql.js";
import type { ICampaignRepository } from "../domain/height-ports.js";
import type { HeightCampaign } from "../models/height-campaign.js";

const COLUMNS = "id, title, message, audience, notification_type, scheduled_at, sent_at, is_active";
/** Campaigns claimed per scheduler tick. */
const DUE_BATCH = 20;

export class CampaignRepository implements ICampaignRepository {
  constructor(private pool: pg.Pool) {}

  async claimDue(now: Date, maxAgeHours: number): Promise<HeightCampaign[]> {
    const result = await this.pool.query(
      `UPDATE height.notifications SET sent_at = now(), updated_at = now()
       WHERE id IN (
         SELECT id FROM height.notifications
         WHERE is_active AND sent_at IS NULL
           AND scheduled_at <= $1::timestamptz AND scheduled_at > $1::timestamptz - make_interval(hours => $2)
         ORDER BY scheduled_at
         LIMIT ${DUE_BATCH}
         FOR UPDATE SKIP LOCKED
       )
       RETURNING ${COLUMNS}`,
      [now.toISOString(), maxAgeHours]
    );
    return camelizeRows<HeightCampaign>(result.rows);
  }

  async claim(id: string): Promise<HeightCampaign | null> {
    const result = await this.pool.query(
      `UPDATE height.notifications SET sent_at = now(), updated_at = now()
       WHERE id = $1 AND is_active AND sent_at IS NULL
       RETURNING ${COLUMNS}`,
      [id]
    );
    return result.rows[0] ? camelizeRow<HeightCampaign>(result.rows[0]) : null;
  }

  async find(id: string): Promise<HeightCampaign | null> {
    const result = await this.pool.query(`SELECT ${COLUMNS} FROM height.notifications WHERE id = $1`, [id]);
    return result.rows[0] ? camelizeRow<HeightCampaign>(result.rows[0]) : null;
  }

  async audienceUserIds(audience: HeightCampaign["audience"]): Promise<string[]> {
    const inactiveOnly = audience === "inactive"
      ? `AND NOT EXISTS (
           SELECT 1 FROM height.daily_logs l WHERE l.user_id = p.user_id AND l.log_date >= current_date - 7
         )`
      : "";
    const result = await this.pool.query(
      `SELECT p.user_id FROM height.profiles p
       WHERE p.status = 'active' AND p.notifications_enabled ${inactiveOnly}`
    );
    return result.rows.map((row: { user_id: string }) => row.user_id);
  }
}

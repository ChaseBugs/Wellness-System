import type pg from "pg";
import type { AppCode } from "../../../../config/app-catalog.js";
import { camelizeRows } from "../../../../utils/sql.js";
import type { IDeliveryRepository } from "../domain/IDeliveryRepository.js";
import type { Delivery, DeliveryClaim, DeliveryStatus, DeviceTarget, DueReminder, ListDeliveriesQuery } from "../models/push.js";

/** Reminders handled per tick; the rest wait for the next tick. */
const DUE_BATCH = 500;

export class DeliveryRepository implements IDeliveryRepository {
  constructor(private pool: pg.Pool) {}

  async claim(claim: DeliveryClaim): Promise<string | null> {
    const result = await this.pool.query(
      `INSERT INTO notify.deliveries (user_id, app_code, source, source_id, occurrence, title, body, deep_link)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (source, source_id, user_id, occurrence) DO NOTHING
       RETURNING id`,
      [claim.userId, claim.appCode, claim.source, claim.sourceId, claim.occurrence, claim.title, claim.body, claim.deepLink]
    );
    return result.rows[0]?.id ?? null;
  }

  async complete(id: string, status: Exclude<DeliveryStatus, "pending">, deviceCount: number, error: string | null): Promise<void> {
    await this.pool.query(
      "UPDATE notify.deliveries SET status = $2, device_count = $3, error = $4, updated_at = now() WHERE id = $1",
      [id, status, deviceCount, error]
    );
  }

  async dueReminders(now: Date, graceMinutes: number): Promise<DueReminder[]> {
    // Local wall-clock time in each reminder's timezone. A reminder is due from its time of day until
    // `graceMinutes` later (the difference of two times is negative across midnight, so it doesn't wrap).
    // Zones Postgres doesn't know are filtered out first (materialized), so one bad row can't fail the batch.
    const result = await this.pool.query(
      `WITH active AS MATERIALIZED (
         SELECT * FROM notify.reminders
         WHERE is_active AND timezone IN (SELECT name FROM pg_timezone_names)
       )
       SELECT r.id, r.user_id, r.app_code, r.title, r.body, r.deep_link, l.local_date
       FROM active r
       CROSS JOIN LATERAL (
         SELECT ($1::timestamptz AT TIME ZONE r.timezone) AS local_now,
                to_char($1::timestamptz AT TIME ZONE r.timezone, 'YYYY-MM-DD') AS local_date
       ) l
       WHERE EXTRACT(DOW FROM l.local_now)::smallint = ANY (r.days_of_week)
         AND l.local_now::time - r.time_of_day >= interval '0'
         AND l.local_now::time - r.time_of_day < make_interval(mins => $2)
         AND NOT EXISTS (
           SELECT 1 FROM notify.deliveries d
           WHERE d.source = 'reminder' AND d.source_id = r.id AND d.user_id = r.user_id AND d.occurrence = l.local_date
         )
       ORDER BY r.time_of_day
       LIMIT ${DUE_BATCH}`,
      [now.toISOString(), graceMinutes]
    );
    return camelizeRows<DueReminder>(result.rows);
  }

  async devicesFor(userId: string, appCode: AppCode): Promise<DeviceTarget[]> {
    const result = await this.pool.query(
      "SELECT user_id, platform, push_token FROM notify.devices WHERE user_id = $1 AND app_code = $2",
      [userId, appCode]
    );
    return camelizeRows<DeviceTarget>(result.rows);
  }

  async removeTokens(tokens: string[]): Promise<void> {
    if (tokens.length === 0) return;
    await this.pool.query("DELETE FROM notify.devices WHERE push_token = ANY ($1::text[])", [tokens]);
  }

  async marketingOptedIn(userIds: string[]): Promise<string[]> {
    if (userIds.length === 0) return [];
    const result = await this.pool.query(
      "SELECT id FROM identity.users WHERE id = ANY ($1::uuid[]) AND marketing_opt_in",
      [userIds]
    );
    return result.rows.map((row: { id: string }) => row.id);
  }

  async list(query: ListDeliveriesQuery): Promise<Delivery[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    const add = (sql: string, value: unknown) => {
      values.push(value);
      conditions.push(`${sql} $${values.length}`);
    };
    if (query.appCode) add("app_code =", query.appCode);
    if (query.source) add("source =", query.source);
    if (query.status) add("status =", query.status);
    values.push(query.limit);
    const result = await this.pool.query(
      `SELECT * FROM notify.deliveries ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
       ORDER BY created_at DESC LIMIT $${values.length}`,
      values
    );
    return camelizeRows<Delivery>(result.rows);
  }
}

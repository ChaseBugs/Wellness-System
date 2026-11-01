import type pg from "pg";
import type { AppCode } from "../../../../config/app-catalog.js";
import { camelizeRow, camelizeRows } from "../../../../utils/sql.js";
import type { IEventRepository } from "../domain/IEventRepository.js";
import type { NewAnalyticsEvent, RecentEventSignal } from "../models/event.js";
import type { RetentionCounts } from "../models/kpi.js";

const COLUMNS_PER_EVENT = 9;

export class EventRepository implements IEventRepository {
  constructor(private pool: pg.Pool) {}

  async insertMany(events: NewAnalyticsEvent[]): Promise<number> {
    if (events.length === 0) return 0;
    const values: unknown[] = [];
    const rows = events.map((event, index) => {
      values.push(
        event.userId,
        event.anonymousId,
        event.appCode,
        event.name,
        JSON.stringify(event.properties),
        event.sessionId,
        event.platform,
        event.appVersion,
        event.occurredAt
      );
      const base = index * COLUMNS_PER_EVENT;
      return `(${Array.from({ length: COLUMNS_PER_EVENT }, (_value, column) => `$${base + column + 1}`).join(", ")})`;
    });
    const result = await this.pool.query(
      `INSERT INTO analytics.events
         (user_id, anonymous_id, app_code, name, properties, session_id, platform, app_version, occurred_at)
       VALUES ${rows.join(", ")}`,
      values
    );
    return result.rowCount ?? 0;
  }

  async recentSignals(userId: string, appCode: AppCode, sinceDays: number): Promise<RecentEventSignal[]> {
    const result = await this.pool.query(
      `SELECT name, max(occurred_at) AS last_at FROM analytics.events
       WHERE user_id = $1 AND app_code = $2 AND occurred_at >= now() - make_interval(days => $3)
       GROUP BY name`,
      [userId, appCode, sinceDays]
    );
    return camelizeRows<RecentEventSignal>(result.rows);
  }

  async countActive(appCode: AppCode, from: string, to: string): Promise<{ users: number; anonymous: number }> {
    const result = await this.pool.query(
      `SELECT count(DISTINCT user_id)::int AS users,
              count(DISTINCT anonymous_id) FILTER (WHERE user_id IS NULL)::int AS anonymous
       FROM analytics.events
       WHERE app_code = $1 AND occurred_at >= $2::date AND occurred_at < $3::date + 1`,
      [appCode, from, to]
    );
    return camelizeRow<{ users: number; anonymous: number }>(result.rows[0]);
  }

  async topEvents(appCode: AppCode, from: string, to: string, limit: number): Promise<Array<{ name: string; count: number }>> {
    const result = await this.pool.query(
      `SELECT name, count(*)::int AS count FROM analytics.events
       WHERE app_code = $1 AND occurred_at >= $2::date AND occurred_at < $3::date + 1
       GROUP BY name ORDER BY count DESC, name LIMIT $4`,
      [appCode, from, to, limit]
    );
    return camelizeRows<{ name: string; count: number }>(result.rows);
  }

  async retention(appCode: AppCode, from: string, to: string): Promise<RetentionCounts> {
    const result = await this.pool.query(
      `WITH first_seen AS (
         SELECT user_id, min((occurred_at AT TIME ZONE 'UTC')::date) AS cohort_day
         FROM analytics.events WHERE app_code = $1 AND user_id IS NOT NULL
         GROUP BY user_id
         HAVING min((occurred_at AT TIME ZONE 'UTC')::date) BETWEEN $2::date AND $3::date
       ), activity AS (
         SELECT DISTINCT user_id, (occurred_at AT TIME ZONE 'UTC')::date AS day
         FROM analytics.events
         WHERE app_code = $1 AND user_id IN (SELECT user_id FROM first_seen)
       )
       SELECT count(*)::int AS cohort_size,
         count(*) FILTER (WHERE EXISTS (SELECT 1 FROM activity a WHERE a.user_id = f.user_id AND a.day = f.cohort_day + 1))::int AS d1,
         count(*) FILTER (WHERE EXISTS (SELECT 1 FROM activity a WHERE a.user_id = f.user_id AND a.day = f.cohort_day + 7))::int AS d7,
         count(*) FILTER (WHERE EXISTS (SELECT 1 FROM activity a WHERE a.user_id = f.user_id AND a.day = f.cohort_day + 30))::int AS d30
       FROM first_seen f`,
      [appCode, from, to]
    );
    return camelizeRow<RetentionCounts>(result.rows[0]);
  }
}

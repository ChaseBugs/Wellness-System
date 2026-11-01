import type pg from "pg";
import type { AppCode } from "../../../../config/app-catalog.js";
import type { PageQuery } from "../../../../utils/pagination.js";
import { camelizeRow, camelizeRows, splitTotal } from "../../../../utils/sql.js";
import type { ISessionRepository } from "../domain/ISessionRepository.js";
import type { CompleteSessionInput, DayActivity, Session } from "../models/session.js";

const UTC_DAY = "to_char((completed_at AT TIME ZONE 'UTC')::date, 'YYYY-MM-DD')";

export class SessionRepository implements ISessionRepository {
  constructor(private pool: pg.Pool) {}

  async create(userId: string, appCode: AppCode, routineId: string, totalSteps: number): Promise<Session> {
    const result = await this.pool.query(
      `INSERT INTO routine.sessions (user_id, app_code, routine_id, total_steps)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, appCode, routineId, totalSteps]
    );
    return camelizeRow<Session>(result.rows[0]);
  }

  async findById(id: string, userId: string, appCode: AppCode): Promise<Session | null> {
    const result = await this.pool.query(
      "SELECT * FROM routine.sessions WHERE id = $1 AND user_id = $2 AND app_code = $3",
      [id, userId, appCode]
    );
    return result.rows[0] ? camelizeRow<Session>(result.rows[0]) : null;
  }

  async complete(id: string, input: CompleteSessionInput): Promise<Session> {
    const result = await this.pool.query(
      `UPDATE routine.sessions SET
         status = 'completed', completed_steps = LEAST($2, total_steps), duration_seconds = $3,
         perceived_effort = $4, notes = $5, completed_at = now(), updated_at = now()
       WHERE id = $1 RETURNING *`,
      [id, input.completedSteps, input.durationSeconds, input.perceivedEffort ?? null, input.notes ?? null]
    );
    return camelizeRow<Session>(result.rows[0]);
  }

  async abandon(id: string): Promise<Session> {
    const result = await this.pool.query(
      "UPDATE routine.sessions SET status = 'abandoned', updated_at = now() WHERE id = $1 RETURNING *",
      [id]
    );
    return camelizeRow<Session>(result.rows[0]);
  }

  async list(userId: string, appCode: AppCode, page: PageQuery): Promise<{ items: Session[]; total: number }> {
    const result = await this.pool.query(
      `SELECT *, COUNT(*) OVER() AS total_count FROM routine.sessions
       WHERE user_id = $1 AND app_code = $2 ORDER BY started_at DESC LIMIT $3 OFFSET $4`,
      [userId, appCode, page.limit, page.offset]
    );
    return splitTotal<Session>(result.rows);
  }

  async dailyActivity(userId: string, appCodes: AppCode[], days: number): Promise<DayActivity[]> {
    const result = await this.pool.query(
      `SELECT ${UTC_DAY} AS date, count(*)::int AS sessions,
              coalesce(round(sum(duration_seconds) / 60.0), 0)::int AS minutes
       FROM routine.sessions
       WHERE user_id = $1 AND app_code = ANY($2::text[]) AND status = 'completed'
         AND completed_at >= (now() AT TIME ZONE 'UTC')::date - make_interval(days => $3 - 1)
       GROUP BY 1 ORDER BY 1`,
      [userId, appCodes, days]
    );
    return camelizeRows<DayActivity>(result.rows);
  }

  async completedDates(userId: string, appCode: AppCode, limit: number): Promise<string[]> {
    const result = await this.pool.query<{ date: string }>(
      `SELECT DISTINCT ${UTC_DAY} AS date FROM routine.sessions
       WHERE user_id = $1 AND app_code = $2 AND status = 'completed'
       ORDER BY date DESC LIMIT $3`,
      [userId, appCode, limit]
    );
    return result.rows.map((row) => row.date);
  }

  async countCompleted(userId: string, appCode: AppCode): Promise<number> {
    const result = await this.pool.query<{ count: number }>(
      "SELECT count(*)::int AS count FROM routine.sessions WHERE user_id = $1 AND app_code = $2 AND status = 'completed'",
      [userId, appCode]
    );
    return result.rows[0].count;
  }

  async summarizeDay(userId: string, appCodes: AppCode[], date: string): Promise<DayActivity> {
    const result = await this.pool.query(
      `SELECT $3::text AS date, count(*)::int AS sessions,
              coalesce(round(sum(duration_seconds) / 60.0), 0)::int AS minutes
       FROM routine.sessions
       WHERE user_id = $1 AND app_code = ANY($2::text[]) AND status = 'completed'
         AND (completed_at AT TIME ZONE 'UTC')::date = $3::date`,
      [userId, appCodes, date]
    );
    return camelizeRow<DayActivity>(result.rows[0]);
  }
}

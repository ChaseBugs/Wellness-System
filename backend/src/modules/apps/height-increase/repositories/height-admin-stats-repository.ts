import type pg from "pg";
import type { IHeightAdminStatsRepository } from "../domain/IHeightAdminStatsRepository.js";
import type { HeightAdminStats } from "../models/height-admin.js";

const APP = "height-increase";

export class HeightAdminStatsRepository implements IHeightAdminStatsRepository {
  constructor(private pool: pg.Pool) {}

  /** Live content only (published routines/exercises/articles, active campaigns), like the legacy counts. */
  async totals(): Promise<HeightAdminStats["totals"]> {
    const result = await this.pool.query<HeightAdminStats["totals"]>(
      `SELECT
         (SELECT count(*)::int FROM height.profiles) AS users,
         (SELECT count(*)::int FROM height.profiles WHERE status = 'active') AS "activeUsers",
         (SELECT count(*)::int FROM routine.exercises WHERE $1 = ANY(app_codes) AND status = 'published') AS exercises,
         (SELECT count(*)::int FROM routine.routines WHERE app_code = $1 AND status = 'published') AS plans,
         (SELECT count(*)::int FROM content.items WHERE content_type = 'article' AND $1 = ANY(app_codes) AND review_status = 'published') AS articles,
         (SELECT count(*)::int FROM height.daily_logs WHERE log_date = current_date) AS "logsToday",
         (SELECT count(*)::int FROM height.notifications WHERE is_active) AS notifications`,
      [APP]
    );
    return result.rows[0];
  }

  async latestLogs(limit: number): Promise<HeightAdminStats["latestLogs"]> {
    const result = await this.pool.query(
      `SELECT id, user_email AS "userEmail", to_char(log_date, 'YYYY-MM-DD') AS date, height_cm::float AS "heightCm",
              weight_kg::float AS "weightKg", workout_minutes AS "workoutMinutes", sleep_hours::float AS "sleepHours"
       FROM height.log_admin_view ORDER BY log_date DESC, created_at DESC LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  async logsPerDay(days: number): Promise<Array<{ day: string; entries: number; workoutMinutes: number; averageSleepHours: number | null }>> {
    const result = await this.pool.query(
      `SELECT to_char(log_date, 'YYYY-MM-DD') AS day, count(*)::int AS entries,
              coalesce(sum(workout_minutes), 0)::int AS "workoutMinutes", avg(sleep_hours)::float AS "averageSleepHours"
       FROM height.daily_logs WHERE log_date >= current_date - make_interval(days => $1 - 1)
       GROUP BY log_date ORDER BY log_date`,
      [days]
    );
    return result.rows;
  }
}

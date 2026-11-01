import type pg from "pg";
import { camelizeRow, camelizeRows, withTransaction } from "../../../../utils/sql.js";
import type { IActivityRepository } from "../domain/IActivityRepository.js";
import type { ActivityLog, CompleteActivityInput, DailyPlanSlot, DifficultyFeedback } from "../models/library.js";

const PLAN_COLUMNS = "id, child_id, to_char(plan_date, 'YYYY-MM-DD') AS plan_date, slot, content_id, completed_at";

export class ActivityRepository implements IActivityRepository {
  constructor(private pool: pg.Pool) {}

  async createLog(childId: string, contentId: string, recordedBy: string, input: CompleteActivityInput): Promise<ActivityLog> {
    const result = await this.pool.query(
      `INSERT INTO babygrow.activity_logs (child_id, content_id, rating, difficulty_feedback, notes, recorded_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [childId, contentId, input.rating ?? null, input.difficultyFeedback ?? null, input.notes ?? null, recordedBy]
    );
    return camelizeRow<ActivityLog>(result.rows[0]);
  }

  async setLatestDifficulty(childId: string, contentId: string, feedback: DifficultyFeedback): Promise<ActivityLog | null> {
    const result = await this.pool.query(
      `UPDATE babygrow.activity_logs SET difficulty_feedback = $3, updated_at = now()
       WHERE id = (SELECT id FROM babygrow.activity_logs WHERE child_id = $1 AND content_id = $2 ORDER BY completed_at DESC LIMIT 1)
       RETURNING *`,
      [childId, contentId, feedback]
    );
    return result.rows[0] ? camelizeRow<ActivityLog>(result.rows[0]) : null;
  }

  async listLogs(childId: string, limit: number): Promise<ActivityLog[]> {
    const result = await this.pool.query(
      "SELECT * FROM babygrow.activity_logs WHERE child_id = $1 ORDER BY completed_at DESC LIMIT $2",
      [childId, limit]
    );
    return camelizeRows<ActivityLog>(result.rows);
  }

  async completionCounts(contentIds: string[]): Promise<Map<string, number>> {
    if (contentIds.length === 0) return new Map();
    const result = await this.pool.query<{ content_id: string; count: number }>(
      "SELECT content_id, count(*)::int AS count FROM babygrow.activity_logs WHERE content_id = ANY($1::uuid[]) GROUP BY content_id",
      [contentIds]
    );
    return new Map(result.rows.map((row) => [row.content_id, row.count]));
  }

  async findPlan(childId: string, planDate: string): Promise<DailyPlanSlot[]> {
    const result = await this.pool.query(
      `SELECT ${PLAN_COLUMNS} FROM babygrow.daily_activity_plans WHERE child_id = $1 AND plan_date = $2 ORDER BY slot`,
      [childId, planDate]
    );
    return camelizeRows<DailyPlanSlot>(result.rows);
  }

  async savePlan(childId: string, planDate: string, slots: Array<{ slot: number; contentId: string }>): Promise<DailyPlanSlot[]> {
    await withTransaction(this.pool, async (client) => {
      for (const entry of slots) {
        await client.query(
          `INSERT INTO babygrow.daily_activity_plans (child_id, plan_date, slot, content_id) VALUES ($1, $2, $3, $4)
           ON CONFLICT (child_id, plan_date, slot) DO NOTHING`,
          [childId, planDate, entry.slot, entry.contentId]
        );
      }
    });
    return this.findPlan(childId, planDate);
  }

  async completeSlot(childId: string, planDate: string, slot: number): Promise<DailyPlanSlot | null> {
    const result = await this.pool.query(
      `UPDATE babygrow.daily_activity_plans SET completed_at = coalesce(completed_at, now())
       WHERE child_id = $1 AND plan_date = $2 AND slot = $3 RETURNING ${PLAN_COLUMNS}`,
      [childId, planDate, slot]
    );
    return result.rows[0] ? camelizeRow<DailyPlanSlot>(result.rows[0]) : null;
  }
}

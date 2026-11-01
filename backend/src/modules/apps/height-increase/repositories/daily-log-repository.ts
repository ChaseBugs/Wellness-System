import type pg from "pg";
import { camelizeRow, camelizeRows } from "../../../../utils/sql.js";
import type { IDailyLogRepository } from "../domain/height-ports.js";
import type { DailyLog, UpsertDailyLogInput } from "../models/daily-log.js";

// Input field -> column. Only fields present in the request are written, so a later save of the same
// day keeps what an earlier save recorded.
const LOG_COLUMNS: Array<[keyof UpsertDailyLogInput, string]> = [
  ["heightCm", "height_cm"],
  ["weightKg", "weight_kg"],
  ["sleepHours", "sleep_hours"],
  ["waterGlasses", "water_glasses"],
  ["mood", "mood"],
  ["workoutMinutes", "workout_minutes"],
  ["completedExercises", "completed_exercises"],
  ["notes", "notes"]
];

export class DailyLogRepository implements IDailyLogRepository {
  constructor(private pool: pg.Pool) {}

  async upsert(userId: string, input: UpsertDailyLogInput): Promise<DailyLog> {
    const present = LOG_COLUMNS.filter(([field]) => input[field] !== undefined);
    const values = present.map(([field]) => (field === "completedExercises" ? JSON.stringify(input[field]) : input[field]));
    const columns = present.map(([, column]) => column);
    const placeholders = present.map(([field], index) => (field === "completedExercises" ? `$${index + 3}::jsonb` : `$${index + 3}`));
    const updates = columns.map((column) => `${column} = EXCLUDED.${column}`);
    const result = await this.pool.query(
      `INSERT INTO height.daily_logs (user_id, log_date${columns.map((column) => `, ${column}`).join("")})
       VALUES ($1, $2${placeholders.map((placeholder) => `, ${placeholder}`).join("")})
       ON CONFLICT (user_id, log_date) DO UPDATE SET ${[...updates, "updated_at = now()"].join(", ")}
       RETURNING *`,
      [userId, input.date, ...values]
    );
    return camelizeRow<DailyLog>(result.rows[0]);
  }

  async listRecent(userId: string, limit: number): Promise<DailyLog[]> {
    const result = await this.pool.query(
      "SELECT * FROM height.daily_logs WHERE user_id = $1 ORDER BY log_date DESC LIMIT $2",
      [userId, limit]
    );
    return camelizeRows<DailyLog>(result.rows);
  }
}

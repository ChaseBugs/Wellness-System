import type pg from "pg";
import type { AppCode } from "../../../../config/app-catalog.js";
import { buildInsert, buildUpdate, camelizeRow, camelizeRows, type ColumnMap } from "../../../../utils/sql.js";
import type { IReminderRepository } from "../domain/IReminderRepository.js";
import type { CreateReminderInput, Reminder, UpdateReminderInput } from "../models/reminder.js";

const REMINDER_COLUMNS: ColumnMap<CreateReminderInput> = {
  title: "title",
  body: "body",
  timeOfDay: "time_of_day",
  daysOfWeek: "days_of_week",
  timezone: "timezone",
  deepLink: "deep_link",
  isActive: "is_active"
};

// Return "HH:MM" rather than Postgres' "HH:MM:SS" so clients round-trip the value they sent.
const RETURNING = "id, user_id, app_code, title, body, to_char(time_of_day, 'HH24:MI') AS time_of_day, days_of_week, timezone, deep_link, is_active, created_at, updated_at";

export class ReminderRepository implements IReminderRepository {
  constructor(private pool: pg.Pool) {}

  async listForUser(userId: string, appCode: AppCode): Promise<Reminder[]> {
    const result = await this.pool.query(
      `SELECT ${RETURNING} FROM notify.reminders WHERE user_id = $1 AND app_code = $2 ORDER BY time_of_day`,
      [userId, appCode]
    );
    return camelizeRows<Reminder>(result.rows);
  }

  async countForUser(userId: string, appCode: AppCode): Promise<number> {
    const result = await this.pool.query<{ count: number }>(
      "SELECT count(*)::int AS count FROM notify.reminders WHERE user_id = $1 AND app_code = $2",
      [userId, appCode]
    );
    return result.rows[0].count;
  }

  async create(userId: string, appCode: AppCode, input: CreateReminderInput): Promise<Reminder> {
    const { text, values } = buildInsert("notify.reminders", input, REMINDER_COLUMNS, { user_id: userId, app_code: appCode }, RETURNING);
    const result = await this.pool.query(text, values);
    return camelizeRow<Reminder>(result.rows[0]);
  }

  async update(id: string, userId: string, appCode: AppCode, input: UpdateReminderInput): Promise<Reminder | null> {
    const query = buildUpdate("notify.reminders", input, REMINDER_COLUMNS, { id, user_id: userId, app_code: appCode }, {}, RETURNING);
    if (!query) {
      const result = await this.pool.query(
        `SELECT ${RETURNING} FROM notify.reminders WHERE id = $1 AND user_id = $2 AND app_code = $3`,
        [id, userId, appCode]
      );
      return result.rows[0] ? camelizeRow<Reminder>(result.rows[0]) : null;
    }
    const result = await this.pool.query(query.text, query.values);
    return result.rows[0] ? camelizeRow<Reminder>(result.rows[0]) : null;
  }

  async delete(id: string, userId: string, appCode: AppCode): Promise<boolean> {
    const result = await this.pool.query(
      "DELETE FROM notify.reminders WHERE id = $1 AND user_id = $2 AND app_code = $3",
      [id, userId, appCode]
    );
    return (result.rowCount ?? 0) > 0;
  }
}

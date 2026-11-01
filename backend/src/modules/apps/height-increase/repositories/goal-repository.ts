import type pg from "pg";
import { buildInsert, buildUpdate, camelizeRow, camelizeRows, type ColumnMap } from "../../../../utils/sql.js";
import type { IGoalRepository } from "../domain/height-ports.js";
import type { CreateGoalInput, Goal, UpdateGoalInput } from "../models/daily-log.js";

const GOAL_COLUMNS: ColumnMap<UpdateGoalInput> = {
  title: "title",
  type: "goal_type",
  targetValue: "target_value",
  currentValue: "current_value",
  unit: "unit",
  startsAt: "starts_at",
  dueAt: "due_at",
  status: "status"
};

export class GoalRepository implements IGoalRepository {
  constructor(private pool: pg.Pool) {}

  async list(userId: string, status?: Goal["status"]): Promise<Goal[]> {
    const result = await this.pool.query(
      `SELECT * FROM height.goals WHERE user_id = $1 AND ($2::text IS NULL OR status = $2)
       ORDER BY due_at NULLS LAST, created_at`,
      [userId, status ?? null]
    );
    return camelizeRows<Goal>(result.rows);
  }

  async create(userId: string, input: CreateGoalInput): Promise<Goal> {
    const { text, values } = buildInsert("height.goals", input, GOAL_COLUMNS, { user_id: userId });
    const result = await this.pool.query(text, values);
    return camelizeRow<Goal>(result.rows[0]);
  }

  async update(id: string, userId: string, input: UpdateGoalInput): Promise<Goal | null> {
    const query = buildUpdate("height.goals", input, GOAL_COLUMNS, { id, user_id: userId });
    const result = query
      ? await this.pool.query(query.text, query.values)
      : await this.pool.query("SELECT * FROM height.goals WHERE id = $1 AND user_id = $2", [id, userId]);
    return result.rows[0] ? camelizeRow<Goal>(result.rows[0]) : null;
  }
}

import type pg from "pg";
import { buildInsert, buildUpdate, camelizeRow, camelizeRows, splitTotal, type ColumnMap } from "../../../../utils/sql.js";
import type { IExerciseRepository } from "../domain/IExerciseRepository.js";
import type {
  CreateExerciseInput,
  Exercise,
  ExerciseQuery,
  PublishStatus,
  UpdateExerciseInput
} from "../models/exercise.js";

const EXERCISE_COLUMNS: ColumnMap<CreateExerciseInput> = {
  name: "name",
  description: "description",
  appCodes: "app_codes",
  bodyAreas: "body_areas",
  difficulty: "difficulty",
  defaultDurationSeconds: "default_duration_seconds",
  defaultReps: "default_reps",
  media: { column: "media", json: true },
  safetyNotes: "safety_notes",
  contraindications: "contraindications"
};

export class ExerciseRepository implements IExerciseRepository {
  constructor(private pool: pg.Pool) {}

  async list(query: ExerciseQuery): Promise<{ items: Exercise[]; total: number }> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    if (query.appCode) {
      values.push(query.appCode);
      conditions.push(`$${values.length} = ANY(app_codes)`);
    }
    if (query.status) {
      values.push(query.status);
      conditions.push(`status = $${values.length}`);
    }
    if (query.q) {
      values.push(`%${query.q}%`);
      conditions.push(`name ILIKE $${values.length}`);
    }
    values.push(query.limit, query.offset);
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await this.pool.query(
      `SELECT *, COUNT(*) OVER() AS total_count FROM routine.exercises ${where}
       ORDER BY name LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    return splitTotal<Exercise>(result.rows);
  }

  async findById(id: string): Promise<Exercise | null> {
    const result = await this.pool.query("SELECT * FROM routine.exercises WHERE id = $1", [id]);
    return result.rows[0] ? camelizeRow<Exercise>(result.rows[0]) : null;
  }

  async findByIds(ids: string[]): Promise<Exercise[]> {
    if (ids.length === 0) return [];
    const result = await this.pool.query("SELECT * FROM routine.exercises WHERE id = ANY($1::uuid[])", [ids]);
    return camelizeRows<Exercise>(result.rows);
  }

  async create(input: CreateExerciseInput, createdBy: string): Promise<Exercise> {
    const { text, values } = buildInsert("routine.exercises", input, EXERCISE_COLUMNS, {
      created_by: createdBy,
      status: "draft",
      expert_reviewed: false
    });
    const result = await this.pool.query(text, values);
    return camelizeRow<Exercise>(result.rows[0]);
  }

  async update(id: string, input: UpdateExerciseInput): Promise<Exercise | null> {
    const query = buildUpdate("routine.exercises", input, EXERCISE_COLUMNS, { id }, { status: "draft", expert_reviewed: false });
    if (!query) return this.findById(id);
    const result = await this.pool.query(query.text, query.values);
    return result.rows[0] ? camelizeRow<Exercise>(result.rows[0]) : null;
  }

  async setReview(id: string, approved: boolean, notes: string | null): Promise<Exercise | null> {
    const result = await this.pool.query(
      "UPDATE routine.exercises SET expert_reviewed = $2, review_notes = $3, updated_at = now() WHERE id = $1 RETURNING *",
      [id, approved, notes]
    );
    return result.rows[0] ? camelizeRow<Exercise>(result.rows[0]) : null;
  }

  async setStatus(id: string, status: PublishStatus): Promise<Exercise | null> {
    const result = await this.pool.query(
      "UPDATE routine.exercises SET status = $2, updated_at = now() WHERE id = $1 RETURNING *",
      [id, status]
    );
    return result.rows[0] ? camelizeRow<Exercise>(result.rows[0]) : null;
  }
}

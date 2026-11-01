import type pg from "pg";
import { buildInsert, buildUpdate, camelizeRow, splitTotal, withTransaction, type ColumnMap } from "../../../../utils/sql.js";
import type { IRoutineRepository } from "../domain/IRoutineRepository.js";
import type { PublishStatus } from "../models/exercise.js";
import type {
  CreateRoutineInput,
  Routine,
  RoutineQuery,
  RoutineStepInput,
  RoutineWithSteps,
  UpdateRoutineInput
} from "../models/routine.js";

const ROUTINE_COLUMNS: ColumnMap<CreateRoutineInput> = {
  appCode: "app_code",
  title: "title",
  description: "description",
  goal: "goal",
  level: "level",
  estimatedMinutes: "estimated_minutes",
  tags: "tags",
  isPremium: "is_premium"
};

const STEP_COUNT = "(SELECT count(*) FROM routine.routine_steps s WHERE s.routine_id = r.id) AS step_count";

const STEPS_JSON = `COALESCE((
  SELECT json_agg(json_build_object(
    'id', s.id, 'position', s.position, 'exerciseId', e.id, 'exerciseName', e.name,
    'exerciseStatus', e.status, 'exerciseExpertReviewed', e.expert_reviewed,
    'safetyNotes', e.safety_notes, 'media', e.media, 'sets', s.sets, 'reps', s.reps,
    'durationSeconds', s.duration_seconds, 'restSeconds', s.rest_seconds, 'notes', s.notes
  ) ORDER BY s.position)
  FROM routine.routine_steps s JOIN routine.exercises e ON e.id = s.exercise_id
  WHERE s.routine_id = r.id), '[]'::json) AS steps`;

export class RoutineRepository implements IRoutineRepository {
  constructor(private pool: pg.Pool) {}

  async list(query: RoutineQuery): Promise<{ items: Routine[]; total: number }> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    const add = (sql: (placeholder: string) => string, value: unknown) => {
      values.push(value);
      conditions.push(sql(`$${values.length}`));
    };
    if (query.appCode) add((p) => `r.app_code = ${p}`, query.appCode);
    if (query.status) add((p) => `r.status = ${p}`, query.status);
    if (query.level) add((p) => `r.level = ${p}`, query.level);
    if (query.tag) add((p) => `${p} = ANY(r.tags)`, query.tag);
    if (query.goal) add((p) => `r.goal = ${p}`, query.goal);

    values.push(query.limit, query.offset);
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await this.pool.query(
      `SELECT r.*, ${STEP_COUNT}, COUNT(*) OVER() AS total_count FROM routine.routines r ${where}
       ORDER BY r.is_premium, r.estimated_minutes NULLS LAST, r.title
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    return splitTotal<Routine>(result.rows);
  }

  async findById(id: string): Promise<RoutineWithSteps | null> {
    const result = await this.pool.query(`SELECT r.*, ${STEP_COUNT}, ${STEPS_JSON} FROM routine.routines r WHERE r.id = $1`, [id]);
    return result.rows[0] ? camelizeRow<RoutineWithSteps>(result.rows[0]) : null;
  }

  async create(input: CreateRoutineInput, createdBy: string): Promise<RoutineWithSteps> {
    const id = await withTransaction(this.pool, async (client) => {
      const { steps, ...fields } = input;
      const { text, values } = buildInsert("routine.routines", fields, ROUTINE_COLUMNS, {
        created_by: createdBy,
        status: "draft",
        expert_reviewed: false
      }, "id");
      const routineId = (await client.query<{ id: string }>(text, values)).rows[0].id;
      await this.insertSteps(client, routineId, steps);
      return routineId;
    });
    return (await this.findById(id)) as RoutineWithSteps;
  }

  async update(id: string, input: UpdateRoutineInput): Promise<RoutineWithSteps | null> {
    const updated = await withTransaction(this.pool, async (client) => {
      const { steps, ...fields } = input;
      const query = buildUpdate("routine.routines", fields, ROUTINE_COLUMNS, { id }, { status: "draft", expert_reviewed: false }, "id");
      const result = await client.query(query!.text, query!.values);
      if (result.rowCount === 0) return false;
      if (steps) {
        await client.query("DELETE FROM routine.routine_steps WHERE routine_id = $1", [id]);
        await this.insertSteps(client, id, steps);
      }
      return true;
    });
    return updated ? this.findById(id) : null;
  }

  async setReview(id: string, approved: boolean, notes: string | null): Promise<RoutineWithSteps | null> {
    const result = await this.pool.query(
      "UPDATE routine.routines SET expert_reviewed = $2, review_notes = $3, updated_at = now() WHERE id = $1",
      [id, approved, notes]
    );
    return result.rowCount ? this.findById(id) : null;
  }

  async setStatus(id: string, status: PublishStatus): Promise<RoutineWithSteps | null> {
    const result = await this.pool.query("UPDATE routine.routines SET status = $2, updated_at = now() WHERE id = $1", [id, status]);
    return result.rowCount ? this.findById(id) : null;
  }

  private async insertSteps(client: pg.PoolClient, routineId: string, steps: RoutineStepInput[]): Promise<void> {
    for (const [position, step] of steps.entries()) {
      await client.query(
        `INSERT INTO routine.routine_steps (routine_id, position, exercise_id, sets, reps, duration_seconds, rest_seconds, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          routineId,
          position,
          step.exerciseId,
          step.sets ?? null,
          step.reps ?? null,
          step.durationSeconds ?? null,
          step.restSeconds ?? 0,
          step.notes ?? null
        ]
      );
    }
  }
}

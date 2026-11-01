import type pg from "pg";
import { buildInsert, buildUpdate, camelizeRow, splitTotal, type ColumnMap } from "../../../../utils/sql.js";
import type { ICareLogRepository } from "../domain/ICareLogRepository.js";
import type {
  CareDaySummaryResponse,
  CareLog,
  CareLogQuery,
  CreateCareLogInput,
  UpdateCareLogInput
} from "../models/care-log.js";

const CARE_LOG_COLUMNS: ColumnMap<CreateCareLogInput> = {
  logType: "log_type",
  startedAt: "started_at",
  endedAt: "ended_at",
  details: { column: "details", json: true },
  notes: "notes"
};

export class CareLogRepository implements ICareLogRepository {
  constructor(private pool: pg.Pool) {}

  async list(childId: string, query: CareLogQuery): Promise<{ items: CareLog[]; total: number }> {
    const conditions = ["child_id = $1"];
    const values: unknown[] = [childId];
    if (query.logType) {
      values.push(query.logType);
      conditions.push(`log_type = $${values.length}`);
    }
    if (query.from) {
      values.push(query.from);
      conditions.push(`started_at >= $${values.length}`);
    }
    if (query.to) {
      values.push(query.to);
      conditions.push(`started_at < $${values.length}`);
    }
    values.push(query.limit, query.offset);
    const result = await this.pool.query(
      `SELECT *, COUNT(*) OVER() AS total_count FROM babygrow.care_logs
       WHERE ${conditions.join(" AND ")} ORDER BY started_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    return splitTotal<CareLog>(result.rows);
  }

  async create(childId: string, recordedBy: string, input: CreateCareLogInput): Promise<CareLog> {
    const { text, values } = buildInsert("babygrow.care_logs", input, CARE_LOG_COLUMNS, {
      child_id: childId,
      recorded_by: recordedBy
    });
    const result = await this.pool.query(text, values);
    return camelizeRow<CareLog>(result.rows[0]);
  }

  async update(id: string, childId: string, input: UpdateCareLogInput): Promise<CareLog | null> {
    const query = buildUpdate("babygrow.care_logs", input, CARE_LOG_COLUMNS, { id, child_id: childId });
    if (!query) {
      const result = await this.pool.query("SELECT * FROM babygrow.care_logs WHERE id = $1 AND child_id = $2", [id, childId]);
      return result.rows[0] ? camelizeRow<CareLog>(result.rows[0]) : null;
    }
    const result = await this.pool.query(query.text, query.values);
    return result.rows[0] ? camelizeRow<CareLog>(result.rows[0]) : null;
  }

  async delete(id: string, childId: string): Promise<boolean> {
    const result = await this.pool.query("DELETE FROM babygrow.care_logs WHERE id = $1 AND child_id = $2", [id, childId]);
    return (result.rowCount ?? 0) > 0;
  }

  async daySummary(childId: string, date: string, timezone: string): Promise<CareDaySummaryResponse> {
    const result = await this.pool.query(
      `SELECT $2::text AS date,
         count(*) FILTER (WHERE log_type = 'feeding')::int AS feedings,
         coalesce(sum(CASE WHEN jsonb_typeof(details->'amountMl') = 'number' THEN (details->>'amountMl')::numeric END)
                  FILTER (WHERE log_type = 'feeding'), 0) AS feeding_ml,
         coalesce(round(sum(extract(epoch FROM ended_at - started_at) / 60)
                  FILTER (WHERE log_type = 'sleep' AND ended_at IS NOT NULL)), 0)::int AS sleep_minutes,
         count(*) FILTER (WHERE log_type = 'diaper')::int AS diapers
       FROM babygrow.care_logs
       WHERE child_id = $1 AND (started_at AT TIME ZONE $3)::date = $2::date`,
      [childId, date, timezone]
    );
    return camelizeRow<CareDaySummaryResponse>(result.rows[0]);
  }
}

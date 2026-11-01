import type pg from "pg";
import { buildInsert, buildUpdate, camelizeRow, camelizeRows, type ColumnMap } from "../../../../utils/sql.js";
import type { IGrowthRecordRepository } from "../domain/IGrowthRecordRepository.js";
import type { CreateGrowthRecordInput, GrowthRecord, UpdateGrowthRecordInput } from "../models/growth-record.js";

const GROWTH_COLUMNS: ColumnMap<CreateGrowthRecordInput> = {
  measuredOn: "measured_on",
  heightCm: "height_cm",
  weightKg: "weight_kg",
  headCircumferenceCm: "head_circumference_cm",
  notes: "notes"
};

export class GrowthRecordRepository implements IGrowthRecordRepository {
  constructor(private pool: pg.Pool) {}

  async listForChild(childId: string): Promise<GrowthRecord[]> {
    const result = await this.pool.query(
      "SELECT * FROM babygrow.growth_records WHERE child_id = $1 ORDER BY measured_on, created_at",
      [childId]
    );
    return camelizeRows<GrowthRecord>(result.rows);
  }

  async create(childId: string, recordedBy: string, input: CreateGrowthRecordInput): Promise<GrowthRecord> {
    const { text, values } = buildInsert("babygrow.growth_records", input, GROWTH_COLUMNS, {
      child_id: childId,
      recorded_by: recordedBy
    });
    const result = await this.pool.query(text, values);
    return camelizeRow<GrowthRecord>(result.rows[0]);
  }

  async update(id: string, childId: string, input: UpdateGrowthRecordInput): Promise<GrowthRecord | null> {
    const query = buildUpdate("babygrow.growth_records", input, GROWTH_COLUMNS, { id, child_id: childId });
    if (!query) {
      const result = await this.pool.query("SELECT * FROM babygrow.growth_records WHERE id = $1 AND child_id = $2", [id, childId]);
      return result.rows[0] ? camelizeRow<GrowthRecord>(result.rows[0]) : null;
    }
    const result = await this.pool.query(query.text, query.values);
    return result.rows[0] ? camelizeRow<GrowthRecord>(result.rows[0]) : null;
  }

  async delete(id: string, childId: string): Promise<boolean> {
    const result = await this.pool.query("DELETE FROM babygrow.growth_records WHERE id = $1 AND child_id = $2", [id, childId]);
    return (result.rowCount ?? 0) > 0;
  }
}

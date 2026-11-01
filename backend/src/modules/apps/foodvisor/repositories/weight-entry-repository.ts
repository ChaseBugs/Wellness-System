import type pg from "pg";
import { camelizeRow, camelizeRows } from "../../../../utils/sql.js";
import type { IWeightEntryRepository } from "../domain/IWeightEntryRepository.js";
import type { UpsertWeightEntryInput, WeightEntry } from "../models/weight-entry.js";

export class WeightEntryRepository implements IWeightEntryRepository {
  constructor(private pool: pg.Pool) {}

  async listForUser(userId: string, limit: number): Promise<WeightEntry[]> {
    const result = await this.pool.query(
      "SELECT * FROM foodvisor.weight_entries WHERE user_id = $1 ORDER BY measured_on DESC LIMIT $2",
      [userId, limit]
    );
    return camelizeRows<WeightEntry>(result.rows);
  }

  async upsert(userId: string, input: UpsertWeightEntryInput): Promise<WeightEntry> {
    const result = await this.pool.query(
      `INSERT INTO foodvisor.weight_entries (user_id, measured_on, weight_kg, note) VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, measured_on) DO UPDATE SET weight_kg = EXCLUDED.weight_kg, note = EXCLUDED.note, updated_at = now()
       RETURNING *`,
      [userId, input.measuredOn, input.weightKg, input.note ?? null]
    );
    return camelizeRow<WeightEntry>(result.rows[0]);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.pool.query("DELETE FROM foodvisor.weight_entries WHERE id = $1 AND user_id = $2", [id, userId]);
    return (result.rowCount ?? 0) > 0;
  }
}

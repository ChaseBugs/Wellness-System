import type pg from "pg";
import { camelizeRow, camelizeRows } from "../../../../utils/sql.js";
import type { IHeightMeasurementRepository } from "../domain/IHeightMeasurementRepository.js";
import type { HeightMeasurement, UpsertHeightMeasurementInput } from "../models/height-measurement.js";

export class HeightMeasurementRepository implements IHeightMeasurementRepository {
  constructor(private pool: pg.Pool) {}

  async listForUser(userId: string): Promise<HeightMeasurement[]> {
    const result = await this.pool.query(
      "SELECT * FROM height.measurements WHERE user_id = $1 ORDER BY measured_on",
      [userId]
    );
    return camelizeRows<HeightMeasurement>(result.rows);
  }

  async upsert(userId: string, input: UpsertHeightMeasurementInput): Promise<HeightMeasurement> {
    const result = await this.pool.query(
      `INSERT INTO height.measurements (user_id, measured_on, height_cm, weight_kg, notes)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, measured_on) DO UPDATE SET
         height_cm = EXCLUDED.height_cm, weight_kg = EXCLUDED.weight_kg, notes = EXCLUDED.notes, updated_at = now()
       RETURNING *`,
      [userId, input.measuredOn, input.heightCm, input.weightKg ?? null, input.notes ?? null]
    );
    return camelizeRow<HeightMeasurement>(result.rows[0]);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.pool.query("DELETE FROM height.measurements WHERE id = $1 AND user_id = $2", [id, userId]);
    return (result.rowCount ?? 0) > 0;
  }
}

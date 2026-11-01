import type pg from "pg";
import { camelizeRows } from "../../../../utils/sql.js";
import type { IProgramRepository } from "../domain/IProgramRepository.js";
import type { Program } from "../models/program.js";

export class ProgramRepository implements IProgramRepository {
  constructor(private pool: pg.Pool) {}

  async list(): Promise<Program[]> {
    const result = await this.pool.query(
      "SELECT id, title, stage, focus, description, cta, doctor_verified FROM foodvisor.programs ORDER BY created_at"
    );
    return camelizeRows<Program>(result.rows);
  }
}

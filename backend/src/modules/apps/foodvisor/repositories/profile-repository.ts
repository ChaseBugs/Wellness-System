import type pg from "pg";
import { buildInsert, camelizeRow, type ColumnMap } from "../../../../utils/sql.js";
import type { IProfileRepository } from "../domain/IProfileRepository.js";
import type { FoodvisorProfile, UpsertProfileInput } from "../models/profile.js";

const PROFILE_COLUMNS: ColumnMap<UpsertProfileInput> = {
  goal: "goal",
  gender: "gender",
  age: "age",
  heightCm: "height_cm",
  currentWeightKg: "current_weight_kg",
  targetWeightKg: "target_weight_kg",
  activityLevel: "activity_level",
  dietaryRestrictions: "dietary_restrictions",
  medicalConditions: "medical_conditions",
  programStage: "program_stage"
};

export class ProfileRepository implements IProfileRepository {
  constructor(private pool: pg.Pool) {}

  async findByUser(userId: string): Promise<FoodvisorProfile | null> {
    const result = await this.pool.query("SELECT * FROM foodvisor.profiles WHERE user_id = $1", [userId]);
    return result.rows[0] ? camelizeRow<FoodvisorProfile>(result.rows[0]) : null;
  }

  async upsert(userId: string, input: UpsertProfileInput): Promise<FoodvisorProfile> {
    const { text, values } = buildInsert("foodvisor.profiles", input, PROFILE_COLUMNS, { user_id: userId });
    const provided = (Object.keys(PROFILE_COLUMNS) as Array<keyof UpsertProfileInput>)
      .filter((field) => input[field] !== undefined)
      .map((field) => PROFILE_COLUMNS[field] as string);
    // Only the fields the client sent are overwritten on conflict, so partial updates keep the rest.
    const updates = provided.map((column) => `${column} = EXCLUDED.${column}`);
    const conflict = `ON CONFLICT (user_id) DO UPDATE SET ${[...updates, "updated_at = now()"].join(", ")}`;
    const result = await this.pool.query(text.replace(" RETURNING *", ` ${conflict} RETURNING *`), values);
    return camelizeRow<FoodvisorProfile>(result.rows[0]);
  }
}

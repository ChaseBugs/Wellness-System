import type pg from "pg";
import { camelizeRow, type ColumnMap } from "../../../../utils/sql.js";
import type { IParentProfileRepository, ParentProfileFields } from "../domain/IParentProfileRepository.js";
import type { ParentProfile } from "../models/parent-profile.js";

const PROFILE_COLUMNS: ColumnMap<ParentProfileFields> = {
  phoneNumber: "phone_number",
  gender: "gender",
  birthdate: "birthdate",
  profilePictureUrl: "avatar_url",
  relationToBaby: "relation_to_baby"
};

export class ParentProfileRepository implements IParentProfileRepository {
  constructor(private pool: pg.Pool) {}

  async findByUser(userId: string): Promise<ParentProfile | null> {
    const result = await this.pool.query("SELECT * FROM babygrow.parent_profiles WHERE user_id = $1", [userId]);
    return result.rows[0] ? camelizeRow<ParentProfile>(result.rows[0]) : null;
  }

  async upsert(userId: string, input: ParentProfileFields): Promise<ParentProfile> {
    const pairs = (Object.entries(PROFILE_COLUMNS) as Array<[keyof ParentProfileFields, string]>)
      .filter(([field]) => input[field] !== undefined)
      .map(([field, column]) => [column, input[field]] as const);
    const columns = ["user_id", ...pairs.map(([column]) => column)];
    const placeholders = columns.map((_column, index) => `$${index + 1}`);
    const updates = [...pairs.map(([column]) => `${column} = EXCLUDED.${column}`), "updated_at = now()"];
    const result = await this.pool.query(
      `INSERT INTO babygrow.parent_profiles (${columns.join(", ")}) VALUES (${placeholders.join(", ")})
       ON CONFLICT (user_id) DO UPDATE SET ${updates.join(", ")} RETURNING *`,
      [userId, ...pairs.map(([, value]) => value)]
    );
    return camelizeRow<ParentProfile>(result.rows[0]);
  }

  async setActiveChild(userId: string, childId: string | null): Promise<void> {
    await this.pool.query(
      `INSERT INTO babygrow.parent_profiles (user_id, active_child_id) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET active_child_id = EXCLUDED.active_child_id, updated_at = now()`,
      [userId, childId]
    );
  }
}

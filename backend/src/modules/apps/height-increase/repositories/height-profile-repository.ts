import type pg from "pg";
import { buildUpdate, camelizeRow, type ColumnMap } from "../../../../utils/sql.js";
import type { IHeightProfileRepository } from "../domain/height-ports.js";
import type { HeightProfile, UpdateHeightProfileInput } from "../models/height-profile.js";

const PROFILE_COLUMNS: ColumnMap<Omit<UpdateHeightProfileInput, "name">> = {
  targetHeightCm: "target_height_cm",
  birthDate: "birth_date",
  gender: "gender",
  units: "units",
  notificationsEnabled: "notifications_enabled",
  avatarUrl: "avatar_url"
};

export class HeightProfileRepository implements IHeightProfileRepository {
  constructor(private pool: pg.Pool) {}

  async ensure(userId: string): Promise<HeightProfile> {
    const result = await this.pool.query(
      `INSERT INTO height.profiles (user_id) VALUES ($1)
       ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
       RETURNING *`,
      [userId]
    );
    return camelizeRow<HeightProfile>(result.rows[0]);
  }

  async update(userId: string, input: Omit<UpdateHeightProfileInput, "name">): Promise<HeightProfile> {
    await this.ensure(userId);
    const query = buildUpdate("height.profiles", input, PROFILE_COLUMNS, { user_id: userId });
    if (!query) return this.ensure(userId);
    const result = await this.pool.query(query.text, query.values);
    return camelizeRow<HeightProfile>(result.rows[0]);
  }
}

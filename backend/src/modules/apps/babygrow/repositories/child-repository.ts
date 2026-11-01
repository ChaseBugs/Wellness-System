import type pg from "pg";
import { buildUpdate, camelizeRow, camelizeRows, withTransaction, type ColumnMap } from "../../../../utils/sql.js";
import type { IChildRepository } from "../domain/IChildRepository.js";
import type { Caregiver, CaregiverRole, Child, ChildWithRole, CreateChildInput, UpdateChildInput } from "../models/child.js";

const CHILD_COLUMNS: ColumnMap<CreateChildInput> = {
  name: "name",
  birthDate: "birth_date",
  sex: "sex",
  birthWeightKg: "birth_weight_kg",
  birthHeightCm: "birth_height_cm",
  avatarUrl: "avatar_url"
};

export class ChildRepository implements IChildRepository {
  constructor(private pool: pg.Pool) {}

  async listForUser(userId: string): Promise<ChildWithRole[]> {
    const result = await this.pool.query(
      `SELECT c.*, cg.role FROM babygrow.children c
       JOIN babygrow.caregivers cg ON cg.child_id = c.id
       WHERE cg.user_id = $1 ORDER BY c.birth_date DESC`,
      [userId]
    );
    return camelizeRows<ChildWithRole>(result.rows);
  }

  async findForUser(childId: string, userId: string): Promise<ChildWithRole | null> {
    const result = await this.pool.query(
      `SELECT c.*, cg.role FROM babygrow.children c
       JOIN babygrow.caregivers cg ON cg.child_id = c.id
       WHERE c.id = $1 AND cg.user_id = $2`,
      [childId, userId]
    );
    return result.rows[0] ? camelizeRow<ChildWithRole>(result.rows[0]) : null;
  }

  async create(userId: string, input: CreateChildInput): Promise<ChildWithRole> {
    return withTransaction(this.pool, async (client) => {
      const result = await client.query(
        `INSERT INTO babygrow.children (created_by, name, birth_date, sex, birth_weight_kg, birth_height_cm, avatar_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [userId, input.name, input.birthDate, input.sex ?? "unspecified", input.birthWeightKg ?? null, input.birthHeightCm ?? null, input.avatarUrl ?? null]
      );
      const child = camelizeRow<Child>(result.rows[0]);
      await client.query(
        "INSERT INTO babygrow.caregivers (child_id, user_id, role, added_by) VALUES ($1, $2, 'owner', $2)",
        [child.id, userId]
      );
      return { ...child, role: "owner" as const };
    });
  }

  async update(childId: string, input: UpdateChildInput): Promise<void> {
    const query = buildUpdate("babygrow.children", input, CHILD_COLUMNS, { id: childId });
    if (query) await this.pool.query(query.text, query.values);
  }

  async delete(childId: string): Promise<void> {
    await this.pool.query("DELETE FROM babygrow.children WHERE id = $1", [childId]);
  }

  async listCaregivers(childId: string): Promise<Caregiver[]> {
    const result = await this.pool.query(
      `SELECT cg.child_id, cg.user_id, cg.role, cg.created_at, u.email, u.display_name
       FROM babygrow.caregivers cg JOIN identity.users u ON u.id = cg.user_id
       WHERE cg.child_id = $1 ORDER BY cg.created_at`,
      [childId]
    );
    return camelizeRows<Caregiver>(result.rows);
  }

  async upsertCaregiver(childId: string, userId: string, role: CaregiverRole, addedBy: string): Promise<void> {
    // The owner row is never downgraded through an invite.
    await this.pool.query(
      `INSERT INTO babygrow.caregivers (child_id, user_id, role, added_by) VALUES ($1, $2, $3, $4)
       ON CONFLICT (child_id, user_id) DO UPDATE SET role = EXCLUDED.role
       WHERE babygrow.caregivers.role <> 'owner'`,
      [childId, userId, role, addedBy]
    );
  }

  async removeCaregiver(childId: string, userId: string): Promise<boolean> {
    const result = await this.pool.query(
      "DELETE FROM babygrow.caregivers WHERE child_id = $1 AND user_id = $2 AND role <> 'owner'",
      [childId, userId]
    );
    return (result.rowCount ?? 0) > 0;
  }
}

import type pg from "pg";
import { camelizeRow, camelizeRows } from "../../../../utils/sql.js";
import type { IMilestoneRepository } from "../domain/IMilestoneRepository.js";
import type { ChildMilestoneRow, DefinitionQuery, MilestoneDefinition, RecordMilestoneInput } from "../models/milestone.js";

const DEFINITION_FIELDS = `d.id, d.month, d.domain AS milestone_type, d.title, d.description, d.question, d.related_activity,
  d.display_order, d.expert_reviewed`;

export class MilestoneRepository implements IMilestoneRepository {
  constructor(private pool: pg.Pool) {}

  async listPublished(query: DefinitionQuery): Promise<MilestoneDefinition[]> {
    const conditions = ["is_published"];
    const values: unknown[] = [];
    if (query.month !== undefined) {
      values.push(query.month);
      conditions.push(`month = $${values.length}`);
    }
    if (query.domain) {
      values.push(query.domain);
      conditions.push(`domain = $${values.length}`);
    }
    const result = await this.pool.query(
      `SELECT * FROM babygrow.milestone_definitions WHERE ${conditions.join(" AND ")}
       ORDER BY month NULLS LAST, domain, display_order, title`,
      values
    );
    return camelizeRows<MilestoneDefinition>(result.rows);
  }

  async findDefinition(id: string): Promise<MilestoneDefinition | null> {
    const result = await this.pool.query("SELECT * FROM babygrow.milestone_definitions WHERE id = $1", [id]);
    return result.rows[0] ? camelizeRow<MilestoneDefinition>(result.rows[0]) : null;
  }

  async setReviewed(id: string, approved: boolean): Promise<MilestoneDefinition | null> {
    const result = await this.pool.query(
      `UPDATE babygrow.milestone_definitions
       SET expert_reviewed = $2, is_published = CASE WHEN $2 THEN true ELSE is_published END, updated_at = now()
       WHERE id = $1 RETURNING *`,
      [id, approved]
    );
    return result.rows[0] ? camelizeRow<MilestoneDefinition>(result.rows[0]) : null;
  }

  async listForChild(childId: string, month?: number): Promise<ChildMilestoneRow[]> {
    const result =
      month === undefined
        ? await this.pool.query(
            `SELECT ${DEFINITION_FIELDS}, mc.id AS check_id, mc.status, mc.achieved_on, mc.notes
             FROM babygrow.milestone_checks mc JOIN babygrow.milestone_definitions d ON d.id = mc.milestone_id
             WHERE mc.child_id = $1 ORDER BY d.month NULLS LAST, d.domain, d.display_order`,
            [childId]
          )
        : await this.pool.query(
            `SELECT ${DEFINITION_FIELDS}, mc.id AS check_id, mc.status, mc.achieved_on, mc.notes
             FROM babygrow.milestone_definitions d
             LEFT JOIN babygrow.milestone_checks mc ON mc.milestone_id = d.id AND mc.child_id = $1
             WHERE d.is_published AND d.month = $2 ORDER BY d.domain, d.display_order, d.title`,
            [childId, month]
          );
    return camelizeRows<ChildMilestoneRow>(result.rows);
  }

  async upsertCheck(childId: string, milestoneId: string, recordedBy: string, input: RecordMilestoneInput): Promise<void> {
    await this.pool.query(
      `INSERT INTO babygrow.milestone_checks (child_id, milestone_id, status, achieved_on, notes, recorded_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (child_id, milestone_id) DO UPDATE SET
         status = EXCLUDED.status, achieved_on = EXCLUDED.achieved_on, notes = EXCLUDED.notes, updated_at = now()`,
      [childId, milestoneId, input.status, input.achievedOn ?? null, input.notes ?? null, recordedBy]
    );
  }

  async deleteCheck(childId: string, milestoneId: string): Promise<boolean> {
    const result = await this.pool.query(
      "DELETE FROM babygrow.milestone_checks WHERE child_id = $1 AND milestone_id = $2",
      [childId, milestoneId]
    );
    return (result.rowCount ?? 0) > 0;
  }
}

import type pg from "pg";
import { camelizeRow, camelizeRows, withTransaction } from "../../../../utils/sql.js";
import type { IMealPlanRepository } from "../domain/IMealPlanRepository.js";
import type { CreateMealPlanInput, MealPlan } from "../models/meal-plan.js";

const ITEMS_JSON = `COALESCE((
  SELECT json_agg(json_build_object(
    'id', i.id, 'dayIndex', i.day_index, 'mealType', i.meal_type, 'contentId', i.content_id, 'servings', i.servings
  ) ORDER BY i.day_index, i.meal_type)
  FROM recipes.meal_plan_items i WHERE i.meal_plan_id = p.id), '[]'::json) AS items`;

export class MealPlanRepository implements IMealPlanRepository {
  constructor(private pool: pg.Pool) {}

  async list(userId: string): Promise<MealPlan[]> {
    const result = await this.pool.query(
      `SELECT p.*, ${ITEMS_JSON} FROM recipes.meal_plans p WHERE p.user_id = $1 ORDER BY p.start_date DESC LIMIT 52`,
      [userId]
    );
    return camelizeRows<MealPlan>(result.rows);
  }

  async findById(id: string, userId: string): Promise<MealPlan | null> {
    const result = await this.pool.query(
      `SELECT p.*, ${ITEMS_JSON} FROM recipes.meal_plans p WHERE p.id = $1 AND p.user_id = $2`,
      [id, userId]
    );
    return result.rows[0] ? camelizeRow<MealPlan>(result.rows[0]) : null;
  }

  async create(userId: string, input: CreateMealPlanInput): Promise<MealPlan> {
    const id = await withTransaction(this.pool, async (client) => {
      const inserted = await client.query<{ id: string }>(
        "INSERT INTO recipes.meal_plans (user_id, title, start_date) VALUES ($1, $2, $3) RETURNING id",
        [userId, input.title, input.startDate]
      );
      const planId = inserted.rows[0].id;
      for (const item of input.items) {
        await client.query(
          `INSERT INTO recipes.meal_plan_items (meal_plan_id, day_index, meal_type, content_id, servings)
           VALUES ($1, $2, $3, $4, $5)`,
          [planId, item.dayIndex, item.mealType, item.contentId, item.servings ?? 1]
        );
      }
      return planId;
    });
    return (await this.findById(id, userId)) as MealPlan;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.pool.query("DELETE FROM recipes.meal_plans WHERE id = $1 AND user_id = $2", [id, userId]);
    return (result.rowCount ?? 0) > 0;
  }
}

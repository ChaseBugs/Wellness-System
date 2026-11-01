import type pg from "pg";
import { camelizeRow, camelizeRows, splitTotal, withTransaction } from "../../../../utils/sql.js";
import type { IMealLogRepository } from "../domain/IMealLogRepository.js";
import type { LoggedItemForAnalysis } from "../models/intake-analysis.js";
import type { MacroTotals, MealLog, MealLogQuery, NewMealLog } from "../models/meal-log.js";

const ITEMS_JSON = `COALESCE((
  SELECT json_agg(json_build_object(
    'id', i.id, 'foodId', i.food_id, 'name', i.name, 'quantityG', i.quantity_g,
    'calories', i.calories, 'proteinG', i.protein_g, 'carbsG', i.carbs_g, 'fatG', i.fat_g
  ) ORDER BY i.name)
  FROM foodvisor.meal_log_items i WHERE i.meal_log_id = m.id), '[]'::json) AS items`;

export class MealLogRepository implements IMealLogRepository {
  constructor(private pool: pg.Pool) {}

  async list(userId: string, query: MealLogQuery): Promise<{ items: MealLog[]; total: number }> {
    const conditions = ["m.user_id = $1"];
    const values: unknown[] = [userId];
    if (query.from) {
      values.push(query.from);
      conditions.push(`m.eaten_at >= $${values.length}`);
    }
    if (query.to) {
      values.push(query.to);
      conditions.push(`m.eaten_at < $${values.length}`);
    }
    values.push(query.limit, query.offset);
    const result = await this.pool.query(
      `SELECT m.*, ${ITEMS_JSON}, COUNT(*) OVER() AS total_count FROM foodvisor.meal_logs m
       WHERE ${conditions.join(" AND ")} ORDER BY m.eaten_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    return splitTotal<MealLog>(result.rows);
  }

  async findById(id: string, userId: string): Promise<MealLog | null> {
    const result = await this.pool.query(
      `SELECT m.*, ${ITEMS_JSON} FROM foodvisor.meal_logs m WHERE m.id = $1 AND m.user_id = $2`,
      [id, userId]
    );
    return result.rows[0] ? camelizeRow<MealLog>(result.rows[0]) : null;
  }

  async create(userId: string, log: NewMealLog): Promise<MealLog> {
    const id = await withTransaction(this.pool, async (client) => {
      const inserted = await client.query<{ id: string }>(
        `INSERT INTO foodvisor.meal_logs (user_id, eaten_at, meal_type, source, recipe_content_id, photo_url, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [userId, log.eatenAt, log.mealType, log.source, log.recipeContentId, log.photoUrl, log.notes]
      );
      const mealLogId = inserted.rows[0].id;
      for (const item of log.items) {
        await client.query(
          `INSERT INTO foodvisor.meal_log_items (meal_log_id, food_id, name, quantity_g, calories, protein_g, carbs_g, fat_g)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [mealLogId, item.foodId, item.name, item.quantityG, item.calories, item.proteinG, item.carbsG, item.fatG]
        );
      }
      return mealLogId;
    });
    return (await this.findById(id, userId)) as MealLog;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.pool.query("DELETE FROM foodvisor.meal_logs WHERE id = $1 AND user_id = $2", [id, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  async itemsForAnalysis(userId: string, from: string, to: string): Promise<LoggedItemForAnalysis[]> {
    const result = await this.pool.query(
      `SELECT i.name, i.quantity_g, i.calories, i.protein_g, i.carbs_g, i.fat_g,
              CASE WHEN f.id IS NULL THEN NULL ELSE json_build_object(
                'calories', f.calories, 'macros', f.macros, 'sugar', f.sugar, 'saturatedFat', f.saturated_fat,
                'cholesterolMg', f.cholesterol_mg, 'vitamins', f.vitamins, 'minerals', f.minerals
              ) END AS food
       FROM foodvisor.meal_logs m
       JOIN foodvisor.meal_log_items i ON i.meal_log_id = m.id
       LEFT JOIN foodvisor.foods f ON f.id = i.food_id
       WHERE m.user_id = $1 AND m.eaten_at >= $2 AND m.eaten_at < $3`,
      [userId, from, to]
    );
    return camelizeRows<LoggedItemForAnalysis>(result.rows);
  }

  async dayTotals(userId: string, date: string, timezone: string): Promise<MacroTotals & { mealsLogged: number }> {
    const result = await this.pool.query(
      `SELECT count(DISTINCT m.id)::int AS meals_logged,
              coalesce(sum(i.calories), 0) AS calories, coalesce(sum(i.protein_g), 0) AS protein_g,
              coalesce(sum(i.carbs_g), 0) AS carbs_g, coalesce(sum(i.fat_g), 0) AS fat_g
       FROM foodvisor.meal_logs m LEFT JOIN foodvisor.meal_log_items i ON i.meal_log_id = m.id
       WHERE m.user_id = $1 AND (m.eaten_at AT TIME ZONE $3)::date = $2::date`,
      [userId, date, timezone]
    );
    return camelizeRow<MacroTotals & { mealsLogged: number }>(result.rows[0]);
  }
}

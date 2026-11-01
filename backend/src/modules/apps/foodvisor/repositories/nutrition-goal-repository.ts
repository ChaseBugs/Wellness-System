import type pg from "pg";
import { camelizeRow } from "../../../../utils/sql.js";
import type { INutritionGoalRepository } from "../domain/INutritionGoalRepository.js";
import type { NutritionGoal, UpsertNutritionGoalInput } from "../models/nutrition-goal.js";

export class NutritionGoalRepository implements INutritionGoalRepository {
  constructor(private pool: pg.Pool) {}

  async findByUser(userId: string): Promise<NutritionGoal | null> {
    const result = await this.pool.query("SELECT * FROM foodvisor.nutrition_goals WHERE user_id = $1", [userId]);
    return result.rows[0] ? camelizeRow<NutritionGoal>(result.rows[0]) : null;
  }

  async upsert(userId: string, input: UpsertNutritionGoalInput): Promise<NutritionGoal> {
    const result = await this.pool.query(
      `INSERT INTO foodvisor.nutrition_goals (user_id, goal_type, calories, protein_g, carbs_g, fat_g)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET
         goal_type = EXCLUDED.goal_type, calories = EXCLUDED.calories, protein_g = EXCLUDED.protein_g,
         carbs_g = EXCLUDED.carbs_g, fat_g = EXCLUDED.fat_g, updated_at = now()
       RETURNING *`,
      [userId, input.goalType, input.calories, input.proteinG ?? null, input.carbsG ?? null, input.fatG ?? null]
    );
    return camelizeRow<NutritionGoal>(result.rows[0]);
  }
}

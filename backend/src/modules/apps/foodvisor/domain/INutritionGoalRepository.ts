import type { NutritionGoal, UpsertNutritionGoalInput } from "../models/nutrition-goal.js";

export interface INutritionGoalRepository {
  findByUser(userId: string): Promise<NutritionGoal | null>;
  upsert(userId: string, input: UpsertNutritionGoalInput): Promise<NutritionGoal>;
}

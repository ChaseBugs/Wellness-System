import type { INutritionGoalRepository } from "../domain/INutritionGoalRepository.js";
import type { NutritionGoal, NutritionGoalResponse, UpsertNutritionGoalInput } from "../models/nutrition-goal.js";

export function toNutritionGoalResponse(goal: NutritionGoal): NutritionGoalResponse {
  return {
    goalType: goal.goalType,
    calories: goal.calories,
    proteinG: goal.proteinG,
    carbsG: goal.carbsG,
    fatG: goal.fatG,
    updatedAt: goal.updatedAt
  };
}

export class NutritionGoalService {
  constructor(private nutritionGoalRepository: INutritionGoalRepository) {}

  async get(userId: string): Promise<NutritionGoalResponse | null> {
    const goal = await this.nutritionGoalRepository.findByUser(userId);
    return goal ? toNutritionGoalResponse(goal) : null;
  }

  async upsert(userId: string, input: UpsertNutritionGoalInput): Promise<NutritionGoalResponse> {
    return toNutritionGoalResponse(await this.nutritionGoalRepository.upsert(userId, input));
  }
}

import type { CreateMealPlanInput, MealPlan } from "../models/meal-plan.js";

export interface IMealPlanRepository {
  list(userId: string): Promise<MealPlan[]>;
  findById(id: string, userId: string): Promise<MealPlan | null>;
  /** Inserts the plan and all its items in one transaction. */
  create(userId: string, input: CreateMealPlanInput): Promise<MealPlan>;
  delete(id: string, userId: string): Promise<boolean>;
}

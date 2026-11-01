export type GoalType = "lose" | "maintain" | "gain" | "custom";

export interface NutritionGoal {
  userId: string;
  goalType: GoalType;
  calories: number;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Targets are set by the user (or their professional); the API does not prescribe calorie goals. */
export interface UpsertNutritionGoalInput {
  goalType: GoalType;
  calories: number;
  proteinG?: number | null;
  carbsG?: number | null;
  fatG?: number | null;
}

export interface NutritionGoalResponse {
  goalType: GoalType;
  calories: number;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  updatedAt: Date;
}

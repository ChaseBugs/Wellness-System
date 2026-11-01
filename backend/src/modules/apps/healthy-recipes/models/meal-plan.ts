// Defined locally: app modules never import from each other.
export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export interface MealPlanItem {
  id: string;
  dayIndex: number;
  mealType: MealType;
  contentId: string;
  servings: number;
}

export interface MealPlan {
  id: string;
  userId: string;
  title: string;
  startDate: string;
  items: MealPlanItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MealPlanItemInput {
  /** 0 = startDate ... 6 = startDate + 6 days. */
  dayIndex: number;
  mealType: MealType;
  contentId: string;
  servings?: number;
}

export interface CreateMealPlanInput {
  title: string;
  startDate: string;
  items: MealPlanItemInput[];
}

export interface MealPlanResponse {
  id: string;
  title: string;
  startDate: string;
  days: Array<{
    date: string;
    meals: Array<{ mealType: MealType; contentId: string; title: string | null; servings: number }>;
  }>;
}

export interface ShoppingListResponse {
  mealPlanId: string;
  items: Array<{ name: string; quantity: number | null; unit: string | null; recipes: string[] }>;
  /** Recipes whose ingredients could not be used (unpublished since planning, or missing data). */
  skippedRecipes: string[];
}

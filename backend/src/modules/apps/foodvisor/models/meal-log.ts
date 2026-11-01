import type { PageQuery } from "../../../../utils/pagination.js";

export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealType = (typeof MEAL_TYPES)[number];
export type MealSource = "manual" | "search" | "photo" | "barcode" | "voice" | "favorite" | "recipe";

export interface MacroTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface MealLogItem extends MacroTotals {
  id: string;
  foodId: string | null;
  name: string;
  quantityG: number | null;
}

export interface MealLog {
  id: string;
  userId: string;
  eatenAt: Date;
  mealType: MealType;
  source: MealSource;
  recipeContentId: string | null;
  photoUrl: string | null;
  notes: string | null;
  items: MealLogItem[];
  createdAt: Date;
  updatedAt: Date;
}

/** Either `foodId` + `quantityG` (nutrients computed from the food) or a manual `name` + `calories`. */
export interface MealItemInput {
  foodId?: string;
  quantityG?: number;
  name?: string;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
}

export interface CreateMealLogInput {
  eatenAt: string;
  mealType: MealType;
  /** "photo" and "barcode" mark how the client identified the items; the AI photo analysis itself runs client-side for now. */
  source?: Exclude<MealSource, "recipe">;
  photoUrl?: string;
  notes?: string;
  items?: MealItemInput[];
  /** Logs a Healthy Recipes recipe using its reviewed nutritionPerServing. */
  recipe?: { contentId: string; servings: number };
}

/** Snapshot rows persisted with the log. */
export interface NewMealLogItem extends MacroTotals {
  foodId: string | null;
  name: string;
  quantityG: number | null;
}

export interface NewMealLog {
  eatenAt: string;
  mealType: MealType;
  source: MealSource;
  recipeContentId: string | null;
  photoUrl: string | null;
  notes: string | null;
  items: NewMealLogItem[];
}

export interface MealLogQuery extends PageQuery {
  from?: string;
  to?: string;
}

export interface MealLogResponse {
  id: string;
  eatenAt: Date;
  mealType: MealType;
  source: MealSource;
  recipeContentId: string | null;
  photoUrl: string | null;
  notes: string | null;
  items: Array<MacroTotals & { foodId: string | null; name: string; quantityG: number | null }>;
  totals: MacroTotals;
}

import type { AppCode } from "../../../../config/app-catalog.js";
import type { MacroTotals } from "./meal-log.js";
import type { NutritionGoalResponse } from "./nutrition-goal.js";

export interface DailySummaryResponse {
  date: string;
  timezone: string;
  mealsLogged: number;
  totals: MacroTotals;
  goal: NutritionGoalResponse | null;
  remainingCalories: number | null;
  /**
   * Present only for routine apps the user explicitly allowed to share `activity_summary` with
   * Foodvisor. Minutes only: no calorie-burn estimates are invented from exercise data.
   */
  connectedActivity: Array<{ appCode: AppCode; sessions: number; minutes: number }>;
}

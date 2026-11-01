import type { LoggedItemForAnalysis } from "../models/intake-analysis.js";
import type { MacroTotals, MealLog, MealLogQuery, NewMealLog } from "../models/meal-log.js";

export interface IMealLogRepository {
  list(userId: string, query: MealLogQuery): Promise<{ items: MealLog[]; total: number }>;
  findById(id: string, userId: string): Promise<MealLog | null>;
  /** Inserts the log and its item snapshots in one transaction. */
  create(userId: string, log: NewMealLog): Promise<MealLog>;
  delete(id: string, userId: string): Promise<boolean>;
  dayTotals(userId: string, date: string, timezone: string): Promise<MacroTotals & { mealsLogged: number }>;
  /** Logged items in [from, to) with the full nutrient profile of their food, for intake analysis. */
  itemsForAnalysis(userId: string, from: string, to: string): Promise<LoggedItemForAnalysis[]>;
}

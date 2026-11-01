import type { Food } from "./food.js";

/** One logged item with the food it came from (null for manual or recipe items). */
export interface LoggedItemForAnalysis {
  name: string;
  quantityG: number | null;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  food: Pick<Food, "calories" | "macros" | "sugar" | "saturatedFat" | "cholesterolMg" | "vitamins" | "minerals"> | null;
}

export interface IntakeRow {
  nutrientKey: string;
  nutrientLabel: string;
  unit: string;
  intake: number;
  RNI?: number;
  AI?: number;
  UL?: number;
  EER?: number;
  /** intake / preferred goal x 100 (rounded); null when no goal exists. */
  percentOfGoal: number | null;
  status: "below" | "in_range" | "above" | "exceeds_ul" | "no_target";
}

export interface IntakeReportResponse {
  range: { from: string; to: string };
  itemCount: number;
  totalCalories: number;
  rows: IntakeRow[];
  warnings: string[];
}

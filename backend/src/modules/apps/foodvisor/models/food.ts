import type { PageQuery } from "../../../../utils/pagination.js";

export type MacroValues = { protein?: number; fat?: number; carbs?: number; fiber?: number };

/** Nutrient values are per `servingSize` (100 g for every imported dataset). */
export interface Food {
  id: string;
  koreanName: string;
  chineseName: string | null;
  brand: string | null;
  category: string | null;
  foodGroup: string | null;
  foodSubgroup: string | null;
  servingSize: string;
  calories: number;
  macros: MacroValues;
  sugar: number;
  saturatedFat: number;
  cholesterolMg: number;
  glycemicIndex: number;
  vitamins: Record<string, number>;
  minerals: Record<string, number>;
  allergens: string[];
  cautionGroups: string[];
  benefits: string | null;
  tags: string[];
  barcode: string | null;
  imageUrl: string | null;
  icon: string | null;
  dataSource: string | null;
  sourceFoodId: string | null;
  sourceNutrition: Record<string, number>;
  doctorVerified: boolean;
}

export interface FoodQuery extends PageQuery {
  q?: string;
  category?: string;
}

/** Filters for the diet optimizer's candidate pool. */
export interface FoodPoolFilter {
  dataSource?: string;
  includeCategories?: string[];
  excludeCategories?: string[];
  limit: number;
}

export type FoodResponse = Omit<Food, "sourceNutrition">;

import type { Food, FoodPoolFilter, FoodQuery } from "../models/food.js";

export interface IFoodRepository {
  search(query: FoodQuery): Promise<{ items: Food[]; total: number }>;
  findById(id: string): Promise<Food | null>;
  findByIds(ids: string[]): Promise<Food[]>;
  findByBarcode(barcode: string): Promise<Food | null>;
  /** Foods with energy > 0, ordered for stable LP candidate selection. */
  optimizerPool(filter: FoodPoolFilter): Promise<Food[]>;
}

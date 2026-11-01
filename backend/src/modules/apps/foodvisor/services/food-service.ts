import { NotFoundError } from "../../../../utils/errors.js";
import { toPage, type Page } from "../../../../utils/pagination.js";
import type { IFoodRepository } from "../domain/IFoodRepository.js";
import type { Food, FoodQuery, FoodResponse } from "../models/food.js";

/** App-facing food lookup. Foods are authored and verified through the admin resource (`/admin/foods`). */
export class FoodService {
  constructor(private foodRepository: IFoodRepository) {}

  async search(query: FoodQuery): Promise<Page<FoodResponse>> {
    const { items, total } = await this.foodRepository.search(query);
    return toPage(items, total, query, (food) => this.toResponse(food));
  }

  async get(id: string): Promise<FoodResponse> {
    const food = await this.foodRepository.findById(id);
    if (!food) throw new NotFoundError("Food");
    return this.toResponse(food);
  }

  async findByBarcode(barcode: string): Promise<FoodResponse> {
    const food = await this.foodRepository.findByBarcode(barcode);
    if (!food) throw new NotFoundError("Food with that barcode");
    return this.toResponse(food);
  }

  private toResponse(food: Food): FoodResponse {
    const { sourceNutrition: _sourceNutrition, ...response } = food;
    return response;
  }
}

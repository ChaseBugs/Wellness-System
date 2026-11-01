import { NotFoundError, ValidationError } from "../../../../utils/errors.js";
import logger, { EMOJIS } from "../../../../utils/logger.js";
import { toPage, type Page } from "../../../../utils/pagination.js";
import type { RecipeAttributes } from "../../../platform/content/models/content-item.js";
import type { RecipeReader } from "../domain/foodvisor-ports.js";
import type { IFoodRepository } from "../domain/IFoodRepository.js";
import type { IMealLogRepository } from "../domain/IMealLogRepository.js";
import type {
  CreateMealLogInput,
  MacroTotals,
  MealLog,
  MealLogQuery,
  MealLogResponse,
  NewMealLogItem
} from "../models/meal-log.js";

const round = (value: number) => Math.round(value * 100) / 100;

export function sumTotals(items: MacroTotals[]): MacroTotals {
  return items.reduce(
    (totals, item) => ({
      calories: round(totals.calories + Number(item.calories)),
      proteinG: round(totals.proteinG + Number(item.proteinG)),
      carbsG: round(totals.carbsG + Number(item.carbsG)),
      fatG: round(totals.fatG + Number(item.fatG))
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );
}

export class MealLogService {
  constructor(
    private mealLogRepository: IMealLogRepository,
    private foodRepository: IFoodRepository,
    private recipeReader: RecipeReader
  ) {}

  async list(userId: string, query: MealLogQuery): Promise<Page<MealLogResponse>> {
    const { items, total } = await this.mealLogRepository.list(userId, query);
    return toPage(items, total, query, (log) => this.toResponse(log));
  }

  async get(userId: string, id: string): Promise<MealLogResponse> {
    const log = await this.mealLogRepository.findById(id, userId);
    if (!log) throw new NotFoundError("Meal log");
    return this.toResponse(log);
  }

  async create(userId: string, input: CreateMealLogInput): Promise<MealLogResponse> {
    if (!input.recipe && !input.items?.length) throw new ValidationError("Provide items or a recipe");

    const items: NewMealLogItem[] = [];
    let recipeContentId: string | null = null;
    if (input.recipe) {
      items.push(await this.recipeItem(input.recipe.contentId, input.recipe.servings));
      recipeContentId = input.recipe.contentId;
    }
    items.push(...(await this.resolveItems(input.items ?? [])));

    const log = await this.mealLogRepository.create(userId, {
      eatenAt: input.eatenAt,
      mealType: input.mealType,
      source: recipeContentId ? "recipe" : (input.source ?? "manual"),
      recipeContentId,
      photoUrl: input.photoUrl ?? null,
      notes: input.notes ?? null,
      items
    });
    logger.successWithEmoji(EMOJIS.CREATE, "Meal logged", "FOODVISOR", { userId, items: items.length, fromRecipe: Boolean(recipeContentId) });
    return this.toResponse(log);
  }

  async delete(userId: string, id: string): Promise<void> {
    if (!(await this.mealLogRepository.delete(id, userId))) throw new NotFoundError("Meal log");
  }

  /** Closes the Healthy Recipes -> Foodvisor loop using the recipe's reviewed per-serving nutrition. */
  private async recipeItem(contentId: string, servings: number): Promise<NewMealLogItem> {
    const [recipe] = await this.recipeReader.findPublishedByIds([contentId]);
    if (!recipe || recipe.contentType !== "recipe") throw new NotFoundError("Recipe");
    const nutrition = (recipe.attributes as Partial<RecipeAttributes>).nutritionPerServing;
    if (!nutrition || typeof nutrition.calories !== "number") {
      throw new ValidationError("This recipe has no reviewed nutrition data; log its ingredients instead");
    }
    return {
      foodId: null,
      name: recipe.title,
      quantityG: null,
      calories: round(nutrition.calories * servings),
      proteinG: round((nutrition.proteinG ?? 0) * servings),
      carbsG: round((nutrition.carbsG ?? 0) * servings),
      fatG: round((nutrition.fatG ?? 0) * servings)
    };
  }

  private async resolveItems(inputs: CreateMealLogInput["items"] & object): Promise<NewMealLogItem[]> {
    const foodIds = [...new Set(inputs.filter((item) => item.foodId).map((item) => item.foodId as string))];
    const foods = new Map((await this.foodRepository.findByIds(foodIds)).map((food) => [food.id, food]));

    return inputs.map((item, index) => {
      if (item.foodId) {
        const food = foods.get(item.foodId);
        if (!food) throw new ValidationError(`items[${index}].foodId does not exist`);
        if (!item.quantityG) throw new ValidationError(`items[${index}].quantityG is required with foodId`);
        // Food values are per 100 g (the serving basis of every imported dataset).
        const factor = item.quantityG / 100;
        return {
          foodId: food.id,
          name: food.koreanName,
          quantityG: item.quantityG,
          calories: round(Number(food.calories) * factor),
          proteinG: round(Number(food.macros?.protein ?? 0) * factor),
          carbsG: round(Number(food.macros?.carbs ?? 0) * factor),
          fatG: round(Number(food.macros?.fat ?? 0) * factor)
        };
      }
      if (!item.name || item.calories === undefined) {
        throw new ValidationError(`items[${index}] needs foodId + quantityG, or name + calories`);
      }
      return {
        foodId: null,
        name: item.name,
        quantityG: item.quantityG ?? null,
        calories: round(item.calories),
        proteinG: round(item.proteinG ?? 0),
        carbsG: round(item.carbsG ?? 0),
        fatG: round(item.fatG ?? 0)
      };
    });
  }

  private toResponse(log: MealLog): MealLogResponse {
    const items = log.items.map((item) => ({
      foodId: item.foodId,
      name: item.name,
      quantityG: item.quantityG,
      calories: Number(item.calories),
      proteinG: Number(item.proteinG),
      carbsG: Number(item.carbsG),
      fatG: Number(item.fatG)
    }));
    return {
      id: log.id,
      eatenAt: log.eatenAt,
      mealType: log.mealType,
      source: log.source,
      recipeContentId: log.recipeContentId,
      photoUrl: log.photoUrl,
      notes: log.notes,
      items,
      totals: sumTotals(items)
    };
  }
}

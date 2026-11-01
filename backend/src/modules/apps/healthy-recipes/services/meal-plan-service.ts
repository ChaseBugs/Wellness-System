import { NotFoundError, ValidationError } from "../../../../utils/errors.js";
import type { ContentItem, RecipeAttributes } from "../../../platform/content/models/content-item.js";
import { normalizeIngredients } from "../../../platform/content/recipe-format.js";
import type { IMealPlanRepository } from "../domain/IMealPlanRepository.js";
import type { RecipeCatalog } from "../domain/recipes-ports.js";
import type { CreateMealPlanInput, MealPlan, MealPlanResponse, ShoppingListResponse } from "../models/meal-plan.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Seven-day plans built from published recipes (the strategy's "Meal Planner as a feature first"). */
export class MealPlanService {
  constructor(
    private mealPlanRepository: IMealPlanRepository,
    private catalog: RecipeCatalog
  ) {}

  async list(userId: string): Promise<MealPlanResponse[]> {
    const plans = await this.mealPlanRepository.list(userId);
    const titles = await this.titlesFor(plans.flatMap((plan) => plan.items.map((item) => item.contentId)));
    return plans.map((plan) => this.toResponse(plan, titles));
  }

  async get(userId: string, id: string): Promise<MealPlanResponse> {
    const plan = await this.require(userId, id);
    return this.toResponse(plan, await this.titlesFor(plan.items.map((item) => item.contentId)));
  }

  async create(userId: string, input: CreateMealPlanInput): Promise<MealPlanResponse> {
    const ids = [...new Set(input.items.map((item) => item.contentId))];
    const recipes = await this.catalog.findPublishedByIds(ids);
    const valid = new Set(recipes.filter((recipe) => recipe.contentType === "recipe").map((recipe) => recipe.id));
    const invalid = ids.filter((id) => !valid.has(id));
    if (invalid.length > 0) throw new ValidationError("Meal plans can only contain published recipes", { contentIds: invalid });

    const plan = await this.mealPlanRepository.create(userId, input);
    return this.toResponse(plan, new Map(recipes.map((recipe) => [recipe.id, recipe.title])));
  }

  async delete(userId: string, id: string): Promise<void> {
    if (!(await this.mealPlanRepository.delete(id, userId))) throw new NotFoundError("Meal plan");
  }

  /** Aggregates ingredients across the plan, scaled by planned servings, grouped by name + unit. */
  async shoppingList(userId: string, id: string): Promise<ShoppingListResponse> {
    const plan = await this.require(userId, id);
    const recipes = new Map(
      (await this.catalog.findPublishedByIds(plan.items.map((item) => item.contentId))).map((recipe) => [recipe.id, recipe])
    );

    const lines = new Map<string, { name: string; quantity: number | null; unit: string | null; recipes: Set<string> }>();
    const skipped = new Set<string>();
    for (const item of plan.items) {
      const recipe = recipes.get(item.contentId);
      const attributes = recipe?.attributes as Partial<RecipeAttributes> | undefined;
      const ingredients = normalizeIngredients(attributes?.ingredients);
      if (!recipe || !ingredients.length || !attributes?.servings) {
        skipped.add(recipe?.title ?? item.contentId);
        continue;
      }
      const scale = item.servings / attributes.servings;
      for (const ingredient of ingredients) {
        const unit = ingredient.unit?.trim().toLowerCase() || null;
        const key = `${ingredient.name.trim().toLowerCase()}|${unit ?? ""}`;
        const line = lines.get(key) ?? { name: ingredient.name.trim(), quantity: 0, unit, recipes: new Set<string>() };
        // An ingredient without a quantity ("salt to taste") stays unquantified for the whole line.
        line.quantity =
          line.quantity === null || ingredient.quantity === undefined
            ? null
            : Math.round((line.quantity + ingredient.quantity * scale) * 100) / 100;
        line.recipes.add(recipe.title);
        lines.set(key, line);
      }
    }

    return {
      mealPlanId: plan.id,
      items: [...lines.values()]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((line) => ({ name: line.name, quantity: line.quantity, unit: line.unit, recipes: [...line.recipes] })),
      skippedRecipes: [...skipped]
    };
  }

  private async require(userId: string, id: string): Promise<MealPlan> {
    const plan = await this.mealPlanRepository.findById(id, userId);
    if (!plan) throw new NotFoundError("Meal plan");
    return plan;
  }

  private async titlesFor(ids: string[]): Promise<Map<string, string>> {
    const recipes: ContentItem[] = await this.catalog.findPublishedByIds([...new Set(ids)]);
    return new Map(recipes.map((recipe) => [recipe.id, recipe.title]));
  }

  private toResponse(plan: MealPlan, titles: Map<string, string>): MealPlanResponse {
    return {
      id: plan.id,
      title: plan.title,
      startDate: plan.startDate,
      days: Array.from({ length: 7 }, (_value, dayIndex) => ({
        date: addDays(plan.startDate, dayIndex),
        meals: plan.items
          .filter((item) => item.dayIndex === dayIndex)
          .map((item) => ({
            mealType: item.mealType,
            contentId: item.contentId,
            title: titles.get(item.contentId) ?? null,
            servings: Number(item.servings)
          }))
      }))
    };
  }
}

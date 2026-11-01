import { NotFoundError } from "../../../../utils/errors.js";
import type { ContentItem } from "../../../platform/content/models/content-item.js";
import type { ISavedRecipeRepository } from "../domain/ISavedRecipeRepository.js";
import type { RecipeCatalog } from "../domain/recipes-ports.js";
import type { SavedRecipeResponse } from "../models/saved-recipe.js";

export class SavedRecipeService {
  constructor(
    private savedRecipeRepository: ISavedRecipeRepository,
    private catalog: RecipeCatalog
  ) {}

  /** Saved recipes that were unpublished later are hidden rather than shown broken. */
  async list(userId: string): Promise<SavedRecipeResponse[]> {
    const saved = await this.savedRecipeRepository.list(userId);
    const recipes = new Map(
      (await this.catalog.findPublishedByIds(saved.map((entry) => entry.contentId))).map((recipe) => [recipe.id, recipe])
    );
    return saved
      .filter((entry) => recipes.has(entry.contentId))
      .map((entry) => ({ savedAt: entry.createdAt, recipe: this.toSummary(recipes.get(entry.contentId) as ContentItem) }));
  }

  async save(userId: string, contentId: string): Promise<void> {
    const [recipe] = await this.catalog.findPublishedByIds([contentId]);
    if (!recipe || recipe.contentType !== "recipe") throw new NotFoundError("Recipe");
    await this.savedRecipeRepository.save(userId, contentId);
  }

  async remove(userId: string, contentId: string): Promise<void> {
    if (!(await this.savedRecipeRepository.remove(userId, contentId))) throw new NotFoundError("Saved recipe");
  }

  private toSummary(recipe: ContentItem): SavedRecipeResponse["recipe"] {
    return {
      id: recipe.id,
      contentType: recipe.contentType,
      title: recipe.title,
      summary: recipe.summary,
      appCodes: recipe.appCodes,
      category: recipe.category,
      tags: recipe.tags,
      durationMinutes: recipe.durationMinutes,
      difficulty: recipe.difficulty,
      media: recipe.media,
      locale: recipe.locale,
      isPremium: recipe.isPremium,
      publishedAt: recipe.publishedAt
    };
  }
}

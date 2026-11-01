import { NotFoundError } from "../../../../utils/errors.js";
import type { Page } from "../../../../utils/pagination.js";
import type { ContentItemResponse, ContentSummaryResponse } from "../../../platform/content/models/content-item.js";
import type { RecipeCatalog } from "../domain/recipes-ports.js";
import type { RecipeQuery } from "../models/recipe.js";

/** Healthy Recipes' view of the Content Factory: published recipes enabled for this app. */
export class RecipeService {
  constructor(private catalog: RecipeCatalog) {}

  async list(query: RecipeQuery): Promise<Page<ContentSummaryResponse>> {
    return this.catalog.listPublished({ ...query, appCode: "healthy-recipes", contentType: "recipe" });
  }

  async get(id: string, userId: string): Promise<ContentItemResponse> {
    const recipe = await this.catalog.getPublished(id, userId);
    if (recipe.contentType !== "recipe" || !recipe.appCodes.includes("healthy-recipes")) throw new NotFoundError("Recipe");
    return recipe;
  }
}

import type { ContentSummaryResponse } from "../../../platform/content/models/content-item.js";

export interface SavedRecipe {
  userId: string;
  contentId: string;
  createdAt: Date;
}

export interface SavedRecipeResponse {
  savedAt: Date;
  recipe: ContentSummaryResponse;
}

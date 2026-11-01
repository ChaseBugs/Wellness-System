import type { SavedRecipe } from "../models/saved-recipe.js";

export interface ISavedRecipeRepository {
  list(userId: string): Promise<SavedRecipe[]>;
  save(userId: string, contentId: string): Promise<void>;
  remove(userId: string, contentId: string): Promise<boolean>;
}

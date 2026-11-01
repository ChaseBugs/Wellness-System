import type pg from "pg";
import { camelizeRows } from "../../../../utils/sql.js";
import type { ISavedRecipeRepository } from "../domain/ISavedRecipeRepository.js";
import type { SavedRecipe } from "../models/saved-recipe.js";

export class SavedRecipeRepository implements ISavedRecipeRepository {
  constructor(private pool: pg.Pool) {}

  async list(userId: string): Promise<SavedRecipe[]> {
    const result = await this.pool.query(
      "SELECT * FROM recipes.saved_recipes WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    return camelizeRows<SavedRecipe>(result.rows);
  }

  async save(userId: string, contentId: string): Promise<void> {
    await this.pool.query(
      "INSERT INTO recipes.saved_recipes (user_id, content_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [userId, contentId]
    );
  }

  async remove(userId: string, contentId: string): Promise<boolean> {
    const result = await this.pool.query(
      "DELETE FROM recipes.saved_recipes WHERE user_id = $1 AND content_id = $2",
      [userId, contentId]
    );
    return (result.rowCount ?? 0) > 0;
  }
}

import type { PageQuery } from "../../../../utils/pagination.js";
import type { Difficulty } from "../../../platform/content/models/content-item.js";

export interface RecipeQuery extends PageQuery {
  q?: string;
  category?: string;
  tag?: string;
  difficulty?: Difficulty;
  maxMinutes?: number;
  excludeAllergens?: string[];
}

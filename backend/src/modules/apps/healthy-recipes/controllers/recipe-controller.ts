import { BaseController } from "../../../../utils/base-controller.js";
import { toPageQuery } from "../../../../utils/pagination.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { Difficulty } from "../../../platform/content/models/content-item.js";
import type { RecipeService } from "../services/recipe-service.js";

export class RecipeController extends BaseController {
  constructor(private recipeService: RecipeService) {
    super();
  }

  list = this.handle(async (req, res) => {
    const maxMinutes = this.query(req, "maxMinutes");
    const excludeAllergens = this.query(req, "excludeAllergens");
    sendSuccess(
      res,
      await this.recipeService.list({
        ...toPageQuery(req.query.page, req.query.limit),
        q: this.query(req, "q"),
        category: this.query(req, "category"),
        tag: this.query(req, "tag"),
        difficulty: this.query(req, "difficulty") as Difficulty | undefined,
        maxMinutes: maxMinutes ? Number(maxMinutes) : undefined,
        excludeAllergens: excludeAllergens?.split(",").map((value) => value.trim()).filter(Boolean)
      })
    );
  });

  get = this.handle(async (req, res) => {
    sendSuccess(res, await this.recipeService.get(this.param(req, "id"), this.userId(req)));
  });
}

import { BaseController } from "../../../../utils/base-controller.js";
import { toPageQuery } from "../../../../utils/pagination.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { CreateMealLogInput } from "../models/meal-log.js";
import type { MealLogService } from "../services/meal-log-service.js";

export class MealLogController extends BaseController {
  constructor(private mealLogService: MealLogService) {
    super();
  }

  list = this.handle(async (req, res) => {
    sendSuccess(
      res,
      await this.mealLogService.list(this.userId(req), {
        ...toPageQuery(req.query.page, req.query.limit),
        from: this.query(req, "from"),
        to: this.query(req, "to")
      })
    );
  });

  get = this.handle(async (req, res) => {
    sendSuccess(res, await this.mealLogService.get(this.userId(req), this.param(req, "id")));
  });

  create = this.handle(async (req, res) => {
    const body = req.body as CreateMealLogInput;
    const log = await this.mealLogService.create(this.userId(req), {
      eatenAt: body.eatenAt,
      mealType: body.mealType,
      source: body.source,
      photoUrl: body.photoUrl,
      notes: body.notes,
      items: body.items,
      recipe: body.recipe ? { contentId: body.recipe.contentId, servings: body.recipe.servings } : undefined
    });
    sendSuccess(res, log, 201);
  });

  delete = this.handle(async (req, res) => {
    await this.mealLogService.delete(this.userId(req), this.param(req, "id"));
    res.status(204).end();
  });
}

import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { CreateMealPlanInput, MealPlanItemInput } from "../models/meal-plan.js";
import type { MealPlanService } from "../services/meal-plan-service.js";

export class MealPlanController extends BaseController {
  constructor(private mealPlanService: MealPlanService) {
    super();
  }

  list = this.handle(async (req, res) => {
    sendSuccess(res, await this.mealPlanService.list(this.userId(req)));
  });

  get = this.handle(async (req, res) => {
    sendSuccess(res, await this.mealPlanService.get(this.userId(req), this.param(req, "id")));
  });

  create = this.handle(async (req, res) => {
    const body = req.body as CreateMealPlanInput;
    const plan = await this.mealPlanService.create(this.userId(req), {
      title: body.title,
      startDate: body.startDate,
      items: (body.items as MealPlanItemInput[]).map((item) => ({
        dayIndex: item.dayIndex,
        mealType: item.mealType,
        contentId: item.contentId,
        servings: item.servings
      }))
    });
    sendSuccess(res, plan, 201);
  });

  delete = this.handle(async (req, res) => {
    await this.mealPlanService.delete(this.userId(req), this.param(req, "id"));
    res.status(204).end();
  });

  shoppingList = this.handle(async (req, res) => {
    sendSuccess(res, await this.mealPlanService.shoppingList(this.userId(req), this.param(req, "id")));
  });
}

import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { UpsertNutritionGoalInput } from "../models/nutrition-goal.js";
import type { NutritionGoalService } from "../services/nutrition-goal-service.js";

export class NutritionGoalController extends BaseController {
  constructor(private nutritionGoalService: NutritionGoalService) {
    super();
  }

  get = this.handle(async (req, res) => {
    sendSuccess(res, await this.nutritionGoalService.get(this.userId(req)));
  });

  upsert = this.handle(async (req, res) => {
    const body = req.body as UpsertNutritionGoalInput;
    sendSuccess(
      res,
      await this.nutritionGoalService.upsert(this.userId(req), {
        goalType: body.goalType,
        calories: body.calories,
        proteinG: body.proteinG,
        carbsG: body.carbsG,
        fatG: body.fatG
      })
    );
  });
}

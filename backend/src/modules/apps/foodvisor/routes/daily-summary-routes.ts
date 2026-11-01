import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { validate } from "../../../../middleware/validate.js";
import { ConsentRepository } from "../../../platform/identity/repositories/consent-repository.js";
import { ConsentService } from "../../../platform/identity/services/consent-service.js";
import { createSessionService } from "../../../platform/routine/routine-factory.js";
import { DailySummaryController } from "../controllers/daily-summary-controller.js";
import { MealLogRepository } from "../repositories/meal-log-repository.js";
import { NutritionGoalRepository } from "../repositories/nutrition-goal-repository.js";
import { DailySummaryService } from "../services/daily-summary-service.js";
import { dailySummaryValidation } from "../validators/foodvisor-validator.js";

const pool = getPool();
const controller = new DailySummaryController(
  new DailySummaryService(
    new MealLogRepository(pool),
    new NutritionGoalRepository(pool),
    new ConsentService(new ConsentRepository(pool)),
    createSessionService()
  )
);

export const dailySummaryRouter = Router();

/**
 * @openapi
 * /apps/foodvisor/daily-summary:
 *   get:
 *     tags: [Foodvisor]
 *     summary: Intake vs goal for one day, plus Workout/Yoga minutes when the user consented
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: date, in: query, required: true, schema: { type: string, format: date } }
 *       - { name: timezone, in: query, schema: { type: string, example: Asia/Seoul } }
 *     responses: { 200: { description: Daily summary } }
 */
dailySummaryRouter.get("/", validate(dailySummaryValidation), controller.get);

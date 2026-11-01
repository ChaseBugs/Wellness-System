import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { validate } from "../../../../middleware/validate.js";
import { NutritionGoalController } from "../controllers/nutrition-goal-controller.js";
import { NutritionGoalRepository } from "../repositories/nutrition-goal-repository.js";
import { NutritionGoalService } from "../services/nutrition-goal-service.js";
import { upsertNutritionGoalValidation } from "../validators/foodvisor-validator.js";

const controller = new NutritionGoalController(new NutritionGoalService(new NutritionGoalRepository(getPool())));

export const nutritionGoalRouter = Router();

/**
 * @openapi
 * /apps/foodvisor/nutrition-goal:
 *   get:
 *     tags: [Foodvisor]
 *     summary: The user's daily targets (null until set)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Goal or null } }
 *   put:
 *     tags: [Foodvisor]
 *     summary: Set daily targets
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [goalType, calories]
 *             properties:
 *               goalType: { type: string, enum: [lose, maintain, gain, custom] }
 *               calories: { type: integer }
 *               proteinG: { type: integer }
 *               carbsG: { type: integer }
 *               fatG: { type: integer }
 *     responses: { 200: { description: Saved } }
 */
nutritionGoalRouter.get("/", controller.get);
nutritionGoalRouter.put("/", validate(upsertNutritionGoalValidation), controller.upsert);

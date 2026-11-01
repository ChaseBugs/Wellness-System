import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { validate } from "../../../../middleware/validate.js";
import { createContentItemService } from "../../../platform/content/content-factory.js";
import { MealLogController } from "../controllers/meal-log-controller.js";
import { FoodRepository } from "../repositories/food-repository.js";
import { MealLogRepository } from "../repositories/meal-log-repository.js";
import { MealLogService } from "../services/meal-log-service.js";
import { createMealLogValidation, idValidation, listMealLogsValidation } from "../validators/foodvisor-validator.js";

const pool = getPool();
const controller = new MealLogController(
  new MealLogService(
    new MealLogRepository(pool),
    new FoodRepository(pool),
    createContentItemService()
  )
);

export const mealLogRouter = Router();

/**
 * @openapi
 * /apps/foodvisor/meal-logs:
 *   get:
 *     tags: [Foodvisor]
 *     summary: Meal history (newest first)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: from, in: query, schema: { type: string, format: date-time } }
 *       - { name: to, in: query, schema: { type: string, format: date-time } }
 *     responses: { 200: { description: Page of meal logs } }
 *   post:
 *     tags: [Foodvisor]
 *     summary: Log a meal from foods, manual items, or a Healthy Recipes recipe
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eatenAt, mealType]
 *             properties:
 *               eatenAt: { type: string, format: date-time }
 *               mealType: { type: string, enum: [breakfast, lunch, dinner, snack] }
 *               source: { type: string, enum: [manual, photo, barcode] }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     foodId: { type: string, format: uuid }
 *                     quantityG: { type: number }
 *                     name: { type: string }
 *                     calories: { type: number }
 *               recipe:
 *                 type: object
 *                 properties: { contentId: { type: string, format: uuid }, servings: { type: number } }
 *     responses: { 201: { description: Logged with nutrient snapshot } }
 * /apps/foodvisor/meal-logs/{id}:
 *   get:
 *     tags: [Foodvisor]
 *     summary: Meal log detail
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Meal log } }
 *   delete:
 *     tags: [Foodvisor]
 *     summary: Delete a meal log
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 204: { description: Deleted } }
 */
mealLogRouter.get("/", validate(listMealLogsValidation), controller.list);
mealLogRouter.post("/", validate(createMealLogValidation), controller.create);
mealLogRouter.get("/:id", validate(idValidation), controller.get);
mealLogRouter.delete("/:id", validate(idValidation), controller.delete);

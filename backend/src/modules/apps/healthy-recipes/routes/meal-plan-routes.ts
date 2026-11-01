import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { validate } from "../../../../middleware/validate.js";
import { createContentItemService } from "../../../platform/content/content-factory.js";
import { MealPlanController } from "../controllers/meal-plan-controller.js";
import { MealPlanRepository } from "../repositories/meal-plan-repository.js";
import { MealPlanService } from "../services/meal-plan-service.js";
import { createMealPlanValidation, idValidation } from "../validators/healthy-recipes-validator.js";

const controller = new MealPlanController(new MealPlanService(new MealPlanRepository(getPool()), createContentItemService()));

export const mealPlanRouter = Router();

/**
 * @openapi
 * /apps/healthy-recipes/meal-plans:
 *   get:
 *     tags: [HealthyRecipes]
 *     summary: The user's seven-day meal plans
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Meal plans } }
 *   post:
 *     tags: [HealthyRecipes]
 *     summary: Build a seven-day plan from published recipes
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, startDate, items]
 *             properties:
 *               title: { type: string }
 *               startDate: { type: string, format: date }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [dayIndex, mealType, contentId]
 *                   properties:
 *                     dayIndex: { type: integer, minimum: 0, maximum: 6 }
 *                     mealType: { type: string, enum: [breakfast, lunch, dinner, snack] }
 *                     contentId: { type: string, format: uuid }
 *                     servings: { type: number }
 *     responses: { 201: { description: Created } }
 * /apps/healthy-recipes/meal-plans/{id}:
 *   get:
 *     tags: [HealthyRecipes]
 *     summary: Meal plan by day
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Meal plan } }
 *   delete:
 *     tags: [HealthyRecipes]
 *     summary: Delete a meal plan
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 204: { description: Deleted } }
 * /apps/healthy-recipes/meal-plans/{id}/shopping-list:
 *   get:
 *     tags: [HealthyRecipes]
 *     summary: Aggregated ingredients scaled to planned servings
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Shopping list } }
 */
mealPlanRouter.get("/", controller.list);
mealPlanRouter.post("/", validate(createMealPlanValidation), controller.create);
mealPlanRouter.get("/:id", validate(idValidation), controller.get);
mealPlanRouter.delete("/:id", validate(idValidation), controller.delete);
mealPlanRouter.get("/:id/shopping-list", validate(idValidation), controller.shoppingList);

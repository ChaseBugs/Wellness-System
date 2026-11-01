import { Router } from "express";
import { validate } from "../../../../middleware/validate.js";
import { createContentItemService } from "../../../platform/content/content-factory.js";
import { RecipeController } from "../controllers/recipe-controller.js";
import { RecipeService } from "../services/recipe-service.js";
import { idValidation, listRecipesValidation } from "../validators/healthy-recipes-validator.js";

const controller = new RecipeController(new RecipeService(createContentItemService()));

export const recipeRouter = Router();

/**
 * @openapi
 * /apps/healthy-recipes/recipes:
 *   get:
 *     tags: [HealthyRecipes]
 *     summary: Published recipes with diet filters
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: q, in: query, schema: { type: string } }
 *       - { name: category, in: query, schema: { type: string, example: dinner } }
 *       - { name: tag, in: query, schema: { type: string, example: high-protein } }
 *       - { name: maxMinutes, in: query, schema: { type: integer } }
 *       - { name: excludeAllergens, in: query, schema: { type: string, example: "peanut,gluten" } }
 *       - { $ref: "#/components/parameters/Page" }
 *     responses: { 200: { description: Page of recipes } }
 * /apps/healthy-recipes/recipes/{id}:
 *   get:
 *     tags: [HealthyRecipes]
 *     summary: Recipe with steps, ingredients and nutrition (premium recipes are `locked` without an entitlement)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Recipe } }
 */
recipeRouter.get("/", validate(listRecipesValidation), controller.list);
recipeRouter.get("/:id", validate(idValidation), controller.get);

import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { validate } from "../../../../middleware/validate.js";
import { createContentItemService } from "../../../platform/content/content-factory.js";
import { SavedRecipeController } from "../controllers/saved-recipe-controller.js";
import { SavedRecipeRepository } from "../repositories/saved-recipe-repository.js";
import { SavedRecipeService } from "../services/saved-recipe-service.js";
import { contentIdValidation } from "../validators/healthy-recipes-validator.js";

const controller = new SavedRecipeController(new SavedRecipeService(new SavedRecipeRepository(getPool()), createContentItemService()));

export const savedRecipeRouter = Router();

/**
 * @openapi
 * /apps/healthy-recipes/saved-recipes:
 *   get:
 *     tags: [HealthyRecipes]
 *     summary: The user's saved recipes
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Saved recipes } }
 * /apps/healthy-recipes/saved-recipes/{contentId}:
 *   put:
 *     tags: [HealthyRecipes]
 *     summary: Save a recipe
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: contentId, in: path, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 204: { description: Saved } }
 *   delete:
 *     tags: [HealthyRecipes]
 *     summary: Unsave a recipe
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: contentId, in: path, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 204: { description: Removed } }
 */
savedRecipeRouter.get("/", controller.list);
savedRecipeRouter.put("/:contentId", validate(contentIdValidation), controller.save);
savedRecipeRouter.delete("/:contentId", validate(contentIdValidation), controller.remove);

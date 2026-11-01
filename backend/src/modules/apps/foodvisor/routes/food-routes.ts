import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { validate } from "../../../../middleware/validate.js";
import { FoodController } from "../controllers/food-controller.js";
import { FoodRepository } from "../repositories/food-repository.js";
import { FoodService } from "../services/food-service.js";
import { barcodeValidation, idValidation, searchFoodsValidation } from "../validators/foodvisor-validator.js";

const controller = new FoodController(new FoodService(new FoodRepository(getPool())));

export const foodRouter = Router();

/**
 * @openapi
 * /apps/foodvisor/foods:
 *   get:
 *     tags: [Foodvisor]
 *     summary: Search foods by name (Korean, Chinese, brand or category); values are per servingSize (100 g)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: q, in: query, schema: { type: string } }
 *       - { name: category, in: query, schema: { type: string } }
 *       - { $ref: "#/components/parameters/Page" }
 *       - { $ref: "#/components/parameters/Limit" }
 *     responses: { 200: { description: Page of foods } }
 * /apps/foodvisor/foods/barcode/{barcode}:
 *   get:
 *     tags: [Foodvisor]
 *     summary: Look up a packaged food by barcode (EAN/UPC)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: barcode, in: path, required: true, schema: { type: string } }]
 *     responses: { 200: { description: Food }, 404: { description: Unknown barcode } }
 * /apps/foodvisor/foods/{id}:
 *   get:
 *     tags: [Foodvisor]
 *     summary: Food detail with vitamins, minerals, allergens and cautions
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Food } }
 */
foodRouter.get("/", validate(searchFoodsValidation), controller.search);
foodRouter.get("/barcode/:barcode", validate(barcodeValidation), controller.findByBarcode);
foodRouter.get("/:id", validate(idValidation), controller.get);

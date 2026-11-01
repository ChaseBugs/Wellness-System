import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { validate } from "../../../../middleware/validate.js";
import { HumanTypeController } from "../controllers/human-type-controller.js";
import { HumanTypeRepository } from "../repositories/human-type-repository.js";
import { HumanTypeService } from "../services/human-type-service.js";
import { classifySurveyValidation } from "../validators/foodvisor-validator.js";

export const humanTypeController = new HumanTypeController(new HumanTypeService(new HumanTypeRepository(getPool())));

export const humanTypePublicRouter = Router();
export const humanTypeRouter = Router();

/**
 * @openapi
 * /apps/foodvisor/human-type/questions:
 *   get:
 *     tags: [Foodvisor]
 *     summary: Sasang constitution questionnaire (option scores stay server-side; no auth)
 *     responses: { 200: { description: Questions } }
 * /apps/foodvisor/human-type-surveys:
 *   get:
 *     tags: [Foodvisor]
 *     summary: The user's past questionnaire results
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Surveys } }
 * /apps/foodvisor/human-type-surveys/classify:
 *   post:
 *     tags: [Foodvisor]
 *     summary: Score answers and store the result (a wellness tendency, not a diagnosis)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answers]
 *             properties:
 *               answers: { type: array, items: { type: object, properties: { questionId: { type: string }, value: {} } } }
 *               notes: { type: string }
 *     responses: { 201: { description: Survey result } }
 */
humanTypePublicRouter.get("/human-type/questions", humanTypeController.questions);

humanTypeRouter.get("/human-type-surveys", humanTypeController.mySurveys);
humanTypeRouter.post("/human-type-surveys/classify", validate(classifySurveyValidation), humanTypeController.classify);

import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { authenticate, requireRole } from "../../../../middleware/auth.js";
import { validate } from "../../../../middleware/validate.js";
import { RecommendationRuleController } from "../controllers/recommendation-rule-controller.js";
import { RecommendationRuleRepository } from "../repositories/recommendation-rule-repository.js";
import { RecommendationRuleService } from "../services/recommendation-rule-service.js";
import { createRuleValidation, updateRuleValidation } from "../validators/recommendation-validator.js";

const controller = new RecommendationRuleController(new RecommendationRuleService(new RecommendationRuleRepository(getPool())));
const admin = [authenticate, requireRole("admin")];

export const recommendationRuleRouter = Router();

/**
 * @openapi
 * /recommendations/rules:
 *   get:
 *     tags: [Recommendations]
 *     summary: "Admin: the cross-app recommendation matrix"
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Rules } }
 *   post:
 *     tags: [Recommendations]
 *     summary: "Admin: add a rule"
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, sourceApp, targetApp, triggerEvent, headline]
 *             properties:
 *               code: { type: string }
 *               sourceApp: { type: string }
 *               targetApp: { type: string }
 *               triggerEvent: { type: string, example: exercise_goal_selected }
 *               lookbackDays: { type: integer }
 *               headline: { type: string }
 *               body: { type: string }
 *               deepLink: { type: string }
 *               priority: { type: integer, description: Lower is shown first }
 *               maxImpressionsPerWeek: { type: integer }
 *     responses: { 201: { description: Created } }
 * /recommendations/rules/{id}:
 *   patch:
 *     tags: [Recommendations]
 *     summary: "Admin: tune or disable a rule"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Updated } }
 */
recommendationRuleRouter.get("/rules", ...admin, controller.list);
recommendationRuleRouter.post("/rules", ...admin, validate(createRuleValidation), controller.create);
recommendationRuleRouter.patch("/rules/:id", ...admin, validate(updateRuleValidation), controller.update);

import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { requireAppContext } from "../../../../middleware/app-context.js";
import { authenticate, requireRole } from "../../../../middleware/auth.js";
import { validate } from "../../../../middleware/validate.js";
import { EventRepository } from "../../analytics/repositories/event-repository.js";
import { EventService } from "../../analytics/services/event-service.js";
import { AppInstallRepository } from "../../identity/repositories/app-install-repository.js";
import { UserRepository } from "../../identity/repositories/user-repository.js";
import { RecommendationController } from "../controllers/recommendation-controller.js";
import { InteractionRepository } from "../repositories/interaction-repository.js";
import { RecommendationRuleRepository } from "../repositories/recommendation-rule-repository.js";
import { RecommendationService } from "../services/recommendation-service.js";
import { feedValidation, statsValidation, trackInteractionValidation } from "../validators/recommendation-validator.js";

const pool = getPool();
const controller = new RecommendationController(
  new RecommendationService(
    new RecommendationRuleRepository(pool),
    new InteractionRepository(pool),
    new EventService(new EventRepository(pool)),
    new AppInstallRepository(pool),
    new UserRepository(pool)
  )
);

export const recommendationRouter = Router();

/**
 * @openapi
 * /recommendations:
 *   get:
 *     tags: [Recommendations]
 *     summary: Next-app recommendations for the user in the calling app (empty when opted out)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { $ref: "#/components/parameters/AppCode" }
 *       - { name: limit, in: query, schema: { type: integer, default: 1, maximum: 3 } }
 *     responses: { 200: { description: Recommendations } }
 * /recommendations/stats:
 *   get:
 *     tags: [Recommendations]
 *     summary: "Admin: impressions, clicks, installs and CTR per rule"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: from, in: query, required: true, schema: { type: string, format: date } }
 *       - { name: to, in: query, required: true, schema: { type: string, format: date } }
 *     responses: { 200: { description: Rule statistics } }
 * /recommendations/{ruleId}/interactions:
 *   post:
 *     tags: [Recommendations]
 *     summary: Report impression / click / dismiss / install for a recommendation
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: ruleId, in: path, required: true, schema: { type: string, format: uuid } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [action], properties: { action: { type: string, enum: [impression, click, dismiss, install] } } }
 *     responses: { 201: { description: Recorded } }
 */
recommendationRouter.get("/", authenticate, requireAppContext, validate(feedValidation), controller.feed);
recommendationRouter.get("/stats", authenticate, requireRole("admin"), validate(statsValidation), controller.stats);
recommendationRouter.post("/:ruleId/interactions", authenticate, validate(trackInteractionValidation), controller.track);

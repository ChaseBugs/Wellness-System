import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { requireAppContext } from "../../../../middleware/app-context.js";
import { optionalAuthenticate } from "../../../../middleware/auth.js";
import { validate } from "../../../../middleware/validate.js";
import { EventController } from "../controllers/event-controller.js";
import { EventRepository } from "../repositories/event-repository.js";
import { EventService } from "../services/event-service.js";
import { trackEventsValidation } from "../validators/event-validator.js";

const eventController = new EventController(new EventService(new EventRepository(getPool())));

export const eventRouter = Router();

/**
 * @openapi
 * /analytics/events:
 *   post:
 *     tags: [Analytics]
 *     summary: Batch-ingest app events (signed-in or anonymous)
 *     parameters: [{ $ref: "#/components/parameters/AppCode" }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [events]
 *             properties:
 *               events:
 *                 type: array
 *                 maxItems: 100
 *                 items:
 *                   type: object
 *                   required: [name]
 *                   properties:
 *                     name: { type: string, example: meal_logged }
 *                     properties: { type: object }
 *                     occurredAt: { type: string, format: date-time }
 *                     anonymousId: { type: string }
 *                     sessionId: { type: string }
 *                     platform: { type: string, enum: [ios, android, web] }
 *                     appVersion: { type: string }
 *     responses: { 202: { description: Accepted count } }
 */
eventRouter.post("/events", optionalAuthenticate, requireAppContext, validate(trackEventsValidation), eventController.track);

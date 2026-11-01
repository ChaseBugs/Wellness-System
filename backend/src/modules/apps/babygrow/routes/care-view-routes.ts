import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { validate } from "../../../../middleware/validate.js";
import { createChildService } from "../babygrow-factory.js";
import { CareViewController } from "../controllers/care-view-controller.js";
import { CareLogRepository } from "../repositories/care-log-repository.js";
import { CareViewService } from "../services/care-view-service.js";
import { createDiaperValidation, createFeedingValidation, createSleepValidation, listCareViewValidation } from "../validators/babygrow-validator.js";

const controller = new CareViewController(new CareViewService(new CareLogRepository(getPool()), createChildService()));

// Mounted at /children/:childId. Typed views over care logs; delete through /care-logs/{id}.
export const careViewRouter = Router({ mergeParams: true });

/**
 * @openapi
 * /apps/babygrow/children/{childId}/feedings:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Feedings in a time range (newest first)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: childId, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { name: from, in: query, schema: { type: string, format: date-time } }
 *       - { name: to, in: query, schema: { type: string, format: date-time } }
 *     responses: { 200: { description: Feedings } }
 *   post:
 *     tags: [BabyGrow]
 *     summary: Log a feeding
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: childId, in: path, required: true, schema: { type: string, format: uuid } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [feedingType, startTime]
 *             properties:
 *               feedingType: { type: string, enum: [breast, bottle, formula, solid, pumping] }
 *               startTime: { type: string, format: date-time }
 *               endTime: { type: string, format: date-time }
 *               amountMl: { type: number }
 *               side: { type: string, enum: [left, right, both] }
 *               notes: { type: string }
 *     responses: { 201: { description: Created } }
 * /apps/babygrow/children/{childId}/sleeps:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Sleep sessions in a time range
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: childId, in: path, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Sleeps } }
 *   post:
 *     tags: [BabyGrow]
 *     summary: "Log sleep (sleepType nap or night, qualityRating 1-5)"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: childId, in: path, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 201: { description: Created } }
 * /apps/babygrow/children/{childId}/diapers:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Diaper changes in a time range
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: childId, in: path, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Diapers } }
 *   post:
 *     tags: [BabyGrow]
 *     summary: "Log a diaper change (wet, dirty, mixed, dry)"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: childId, in: path, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 201: { description: Created } }
 */
careViewRouter.get("/feedings", validate(listCareViewValidation), controller.feedings);
careViewRouter.post("/feedings", validate(createFeedingValidation), controller.addFeeding);
careViewRouter.get("/sleeps", validate(listCareViewValidation), controller.sleeps);
careViewRouter.post("/sleeps", validate(createSleepValidation), controller.addSleep);
careViewRouter.get("/diapers", validate(listCareViewValidation), controller.diapers);
careViewRouter.post("/diapers", validate(createDiaperValidation), controller.addDiaper);

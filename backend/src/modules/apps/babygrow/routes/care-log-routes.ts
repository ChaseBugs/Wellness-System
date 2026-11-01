import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { validate } from "../../../../middleware/validate.js";
import { createChildService } from "../babygrow-factory.js";
import { CareLogController } from "../controllers/care-log-controller.js";
import { CareLogRepository } from "../repositories/care-log-repository.js";
import { CareLogService } from "../services/care-log-service.js";
import {
  careDaySummaryValidation,
  careLogIdValidation,
  createCareLogValidation,
  listCareLogsValidation,
  updateCareLogValidation
} from "../validators/babygrow-validator.js";

const controller = new CareLogController(new CareLogService(new CareLogRepository(getPool()), createChildService()));

// Mounted at /children/:childId/care-logs.
export const careLogRouter = Router({ mergeParams: true });

/**
 * @openapi
 * /apps/babygrow/children/{childId}/care-logs:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Feeding, sleep and diaper logs (newest first)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: childId, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { name: type, in: query, schema: { type: string, enum: [feeding, sleep, diaper] } }
 *       - { name: from, in: query, schema: { type: string, format: date-time } }
 *       - { name: to, in: query, schema: { type: string, format: date-time } }
 *     responses: { 200: { description: Page of logs } }
 *   post:
 *     tags: [BabyGrow]
 *     summary: Log a feeding, sleep or diaper change
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: childId, in: path, required: true, schema: { type: string, format: uuid } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [logType, startedAt]
 *             properties:
 *               logType: { type: string, enum: [feeding, sleep, diaper] }
 *               startedAt: { type: string, format: date-time }
 *               endedAt: { type: string, format: date-time }
 *               details: { type: object, example: { method: bottle, amountMl: 120 } }
 *               notes: { type: string }
 *     responses: { 201: { description: Created } }
 * /apps/babygrow/children/{childId}/care-logs/summary:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Daily totals (feedings, ml, sleep minutes, diapers)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: childId, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { name: date, in: query, required: true, schema: { type: string, format: date } }
 *       - { name: timezone, in: query, schema: { type: string, example: Asia/Seoul } }
 *     responses: { 200: { description: Day summary } }
 * /apps/babygrow/children/{childId}/care-logs/{id}:
 *   patch:
 *     tags: [BabyGrow]
 *     summary: Edit a log (e.g. set endedAt when a nap ends)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: childId, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { $ref: "#/components/parameters/Id" }
 *     responses: { 200: { description: Updated } }
 *   delete:
 *     tags: [BabyGrow]
 *     summary: Delete a log
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: childId, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { $ref: "#/components/parameters/Id" }
 *     responses: { 204: { description: Deleted } }
 */
careLogRouter.get("/", validate(listCareLogsValidation), controller.list);
careLogRouter.post("/", validate(createCareLogValidation), controller.create);
careLogRouter.get("/summary", validate(careDaySummaryValidation), controller.daySummary);
careLogRouter.patch("/:id", validate(updateCareLogValidation), controller.update);
careLogRouter.delete("/:id", validate(careLogIdValidation), controller.delete);

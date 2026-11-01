import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { validate } from "../../../../middleware/validate.js";
import { HeightMeasurementController } from "../controllers/height-measurement-controller.js";
import { HeightMeasurementRepository } from "../repositories/height-measurement-repository.js";
import { HeightMeasurementService } from "../services/height-measurement-service.js";
import { measurementIdValidation, recordMeasurementValidation } from "../validators/height-measurement-validator.js";

const controller = new HeightMeasurementController(new HeightMeasurementService(new HeightMeasurementRepository(getPool())));

export const heightMeasurementRouter = Router();

/**
 * @openapi
 * /apps/height-increase/measurements:
 *   get:
 *     tags: [HeightIncrease]
 *     summary: Measurement history and observed trend (no height predictions)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Trend } }
 *   post:
 *     tags: [HeightIncrease]
 *     summary: Record a measurement (one per day; same date replaces)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [measuredOn, heightCm]
 *             properties:
 *               measuredOn: { type: string, format: date }
 *               heightCm: { type: number }
 *               weightKg: { type: number }
 *               notes: { type: string }
 *     responses: { 201: { description: Recorded } }
 * /apps/height-increase/measurements/{id}:
 *   delete:
 *     tags: [HeightIncrease]
 *     summary: Delete a measurement
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 204: { description: Deleted } }
 */
heightMeasurementRouter.get("/", controller.trend);
heightMeasurementRouter.post("/", validate(recordMeasurementValidation), controller.record);
heightMeasurementRouter.delete("/:id", validate(measurementIdValidation), controller.delete);

import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { requireEntitlement } from "../../../../middleware/require-entitlement.js";
import { validate } from "../../../../middleware/validate.js";
import { createEntitlementChecker } from "../../../platform/subscription/entitlement-factory.js";
import { createChildService } from "../babygrow-factory.js";
import { GrowthRecordController } from "../controllers/growth-record-controller.js";
import { GrowthRecordRepository } from "../repositories/growth-record-repository.js";
import { GrowthRecordService } from "../services/growth-record-service.js";
import {
  childIdValidation,
  createGrowthRecordValidation,
  growthRecordIdValidation,
  updateGrowthRecordValidation
} from "../validators/babygrow-validator.js";

const controller = new GrowthRecordController(new GrowthRecordService(new GrowthRecordRepository(getPool()), createChildService()));
const premium = requireEntitlement(createEntitlementChecker(), "babygrow");

// Mounted at /children/:childId/growth-records.
export const growthRecordRouter = Router({ mergeParams: true });

/**
 * @openapi
 * /apps/babygrow/children/{childId}/growth-records:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Height, weight and head-circumference records
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: childId, in: path, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Records (oldest first) } }
 *   post:
 *     tags: [BabyGrow]
 *     summary: Add a measurement
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: childId, in: path, required: true, schema: { type: string, format: uuid } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [measuredOn]
 *             properties:
 *               measuredOn: { type: string, format: date }
 *               heightCm: { type: number }
 *               weightKg: { type: number }
 *               headCircumferenceCm: { type: number }
 *               notes: { type: string }
 *     responses: { 201: { description: Created } }
 * /apps/babygrow/children/{childId}/growth-records/report:
 *   get:
 *     tags: [BabyGrow]
 *     summary: "Premium: growth report with change rates (no percentiles without a validated standard)"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: childId, in: path, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Report }, 403: { description: Entitlement required } }
 * /apps/babygrow/children/{childId}/growth-records/{id}:
 *   patch:
 *     tags: [BabyGrow]
 *     summary: Edit a measurement
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: childId, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { $ref: "#/components/parameters/Id" }
 *     responses: { 200: { description: Updated } }
 *   delete:
 *     tags: [BabyGrow]
 *     summary: Delete a measurement
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: childId, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { $ref: "#/components/parameters/Id" }
 *     responses: { 204: { description: Deleted } }
 */
growthRecordRouter.get("/", validate(childIdValidation), controller.list);
growthRecordRouter.post("/", validate(createGrowthRecordValidation), controller.create);
growthRecordRouter.get("/report", validate(childIdValidation), premium, controller.report);
growthRecordRouter.patch("/:id", validate(updateGrowthRecordValidation), controller.update);
growthRecordRouter.delete("/:id", validate(growthRecordIdValidation), controller.delete);

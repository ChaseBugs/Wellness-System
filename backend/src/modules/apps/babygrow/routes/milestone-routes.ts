import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { requireRole } from "../../../../middleware/auth.js";
import { validate } from "../../../../middleware/validate.js";
import { createChildService } from "../babygrow-factory.js";
import { MilestoneController } from "../controllers/milestone-controller.js";
import { MilestoneRepository } from "../repositories/milestone-repository.js";
import { MilestoneService } from "../services/milestone-service.js";
import {
  childMonthValidation,
  listDefinitionsValidation,
  milestoneCheckIdValidation,
  monthParamValidation,
  recordMilestoneValidation,
  reviewMilestoneDefinitionValidation
} from "../validators/babygrow-validator.js";

const controller = new MilestoneController(new MilestoneService(new MilestoneRepository(getPool()), createChildService()));

export const milestoneDefinitionRouter = Router();
export const childMilestoneRouter = Router({ mergeParams: true });

/**
 * Editors manage definitions through the admin kit (/apps/babygrow/admin/milestone-definitions).
 *
 * @openapi
 * /apps/babygrow/milestone-definitions:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Published milestone definitions, optionally for one month and type
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: month, in: query, schema: { type: integer, minimum: 1, maximum: 72 } }
 *       - { name: type, in: query, schema: { type: string, enum: [physical, cognitive, communication, social_emotional] } }
 *     responses: { 200: { description: "Definitions (expertReviewed shows the review badge)" } }
 * /apps/babygrow/milestone-definitions/month/{month}:
 *   get:
 *     tags: [BabyGrow]
 *     summary: One month's definitions grouped by type
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: month, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: "{ physical: [], cognitive: [], communication: [], social_emotional: [] }" } }
 * /apps/babygrow/milestone-definitions/{id}/review:
 *   post:
 *     tags: [BabyGrow]
 *     summary: "Admin (expert): mark a definition as expert reviewed or not"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [approve], properties: { approve: { type: boolean } } }
 *     responses: { 200: { description: Reviewed } }
 * /apps/babygrow/children/{childId}/milestones:
 *   get:
 *     tags: [BabyGrow]
 *     summary: "With month: every definition of that month with the child's answer; without: the child's answers"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: childId, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { name: month, in: query, schema: { type: integer } }
 *     responses: { 200: { description: Milestones } }
 * /apps/babygrow/children/{childId}/milestones/report:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Yes/almost/no counts per type, for one month or overall
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: childId, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { name: month, in: query, schema: { type: integer } }
 *     responses: { 200: { description: Report } }
 * /apps/babygrow/children/{childId}/milestones/{milestoneId}:
 *   put:
 *     tags: [BabyGrow]
 *     summary: Answer a milestone question (yes, almost, no)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: childId, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { name: milestoneId, in: path, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [yes, almost, no] }
 *               achievedOn: { type: string, format: date }
 *               notes: { type: string }
 *     responses: { 200: { description: Recorded } }
 *   delete:
 *     tags: [BabyGrow]
 *     summary: Clear the answer
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: childId, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { name: milestoneId, in: path, required: true, schema: { type: string, format: uuid } }
 *     responses: { 204: { description: Removed } }
 */
milestoneDefinitionRouter.get("/", validate(listDefinitionsValidation), controller.listDefinitions);
milestoneDefinitionRouter.get("/month/:month", validate(monthParamValidation), controller.definitionsByMonth);
milestoneDefinitionRouter.post("/:id/review", requireRole("admin"), validate(reviewMilestoneDefinitionValidation), controller.reviewDefinition);

childMilestoneRouter.get("/", validate(childMonthValidation), controller.listForChild);
childMilestoneRouter.get("/report", validate(childMonthValidation), controller.report);
childMilestoneRouter.put("/:milestoneId", validate(recordMilestoneValidation), controller.record);
childMilestoneRouter.delete("/:milestoneId", validate(milestoneCheckIdValidation), controller.unrecord);

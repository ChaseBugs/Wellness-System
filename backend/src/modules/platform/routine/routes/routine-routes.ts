import { Router } from "express";
import { authenticate, requireRole } from "../../../../middleware/auth.js";
import { validate } from "../../../../middleware/validate.js";
import { RoutineController } from "../controllers/routine-controller.js";
import { createRoutineService } from "../routine-factory.js";
import {
  createRoutineValidation,
  expertReviewValidation,
  idValidation,
  listEditorValidation,
  updateRoutineValidation
} from "../validators/routine-validator.js";

const controller = new RoutineController(createRoutineService());
const editor = [authenticate, requireRole("editor", "admin")];

export const routineRouter = Router();

/**
 * @openapi
 * /routine/routines:
 *   get:
 *     tags: [Routine]
 *     summary: "Editor: routines for every routine app, in any status"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: app, in: query, schema: { type: string } }
 *       - { name: status, in: query, schema: { type: string, enum: [draft, published, archived] } }
 *     responses: { 200: { description: Page of routines } }
 *   post:
 *     tags: [Routine]
 *     summary: "Editor: create a routine with ordered steps"
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [appCode, title, steps]
 *             properties:
 *               appCode: { type: string, example: daily-workout }
 *               title: { type: string }
 *               goal: { type: string }
 *               level: { type: string, enum: [beginner, intermediate, advanced] }
 *               estimatedMinutes: { type: integer }
 *               isPremium: { type: boolean }
 *               steps:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [exerciseId]
 *                   properties:
 *                     exerciseId: { type: string, format: uuid }
 *                     sets: { type: integer }
 *                     reps: { type: integer }
 *                     durationSeconds: { type: integer }
 *                     restSeconds: { type: integer }
 *     responses: { 201: { description: Created } }
 * /routine/routines/{id}:
 *   get:
 *     tags: [Routine]
 *     summary: "Editor: routine detail"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Routine } }
 *   patch:
 *     tags: [Routine]
 *     summary: "Editor: edit; `steps` replaces the whole list (clears review, unpublishes)"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Updated } }
 * /routine/routines/{id}/review:
 *   post:
 *     tags: [Routine]
 *     summary: "Admin (expert): approve or withdraw sign-off"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Reviewed } }
 * /routine/routines/{id}/publish:
 *   post:
 *     tags: [Routine]
 *     summary: "Editor: publish (routine and all its exercises must be reviewed)"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Published }, 409: { description: Review required } }
 * /routine/routines/{id}/archive:
 *   post:
 *     tags: [Routine]
 *     summary: "Editor: archive"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Archived } }
 */
routineRouter.get("/", ...editor, validate(listEditorValidation), controller.listForEditor);
routineRouter.post("/", ...editor, validate(createRoutineValidation), controller.create);
routineRouter.get("/:id", ...editor, validate(idValidation), controller.getForEditor);
routineRouter.patch("/:id", ...editor, validate(updateRoutineValidation), controller.update);
routineRouter.post("/:id/review", authenticate, requireRole("admin"), validate(expertReviewValidation), controller.review);
routineRouter.post("/:id/publish", ...editor, validate(idValidation), controller.publish);
routineRouter.post("/:id/archive", ...editor, validate(idValidation), controller.archive);

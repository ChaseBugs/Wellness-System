import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { authenticate, requireRole } from "../../../../middleware/auth.js";
import { validate } from "../../../../middleware/validate.js";
import { ExerciseController } from "../controllers/exercise-controller.js";
import { ExerciseRepository } from "../repositories/exercise-repository.js";
import { ExerciseService } from "../services/exercise-service.js";
import {
  createExerciseValidation,
  expertReviewValidation,
  idValidation,
  listEditorValidation,
  updateExerciseValidation
} from "../validators/routine-validator.js";

const controller = new ExerciseController(new ExerciseService(new ExerciseRepository(getPool())));
const editor = [authenticate, requireRole("editor", "admin")];

export const exerciseRouter = Router();

/**
 * @openapi
 * /routine/exercises:
 *   get:
 *     tags: [Routine]
 *     summary: "Editor: exercise library shared by all routine apps"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: app, in: query, schema: { type: string } }
 *       - { name: status, in: query, schema: { type: string, enum: [draft, published, archived] } }
 *       - { name: q, in: query, schema: { type: string } }
 *     responses: { 200: { description: Page of exercises } }
 *   post:
 *     tags: [Routine]
 *     summary: "Editor: create an exercise (draft, unreviewed)"
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, appCodes]
 *             properties:
 *               name: { type: string }
 *               appCodes: { type: array, items: { type: string } }
 *               bodyAreas: { type: array, items: { type: string } }
 *               difficulty: { type: string }
 *               defaultDurationSeconds: { type: integer }
 *               safetyNotes: { type: array, items: { type: string } }
 *               contraindications: { type: array, items: { type: string } }
 *     responses: { 201: { description: Created } }
 * /routine/exercises/{id}:
 *   get:
 *     tags: [Routine]
 *     summary: "Editor: exercise detail"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Exercise } }
 *   patch:
 *     tags: [Routine]
 *     summary: "Editor: edit (clears expert review and unpublishes)"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Updated } }
 * /routine/exercises/{id}/review:
 *   post:
 *     tags: [Routine]
 *     summary: "Admin (expert): approve or withdraw movement-safety sign-off"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [approve], properties: { approve: { type: boolean }, notes: { type: string } } }
 *     responses: { 200: { description: Reviewed } }
 * /routine/exercises/{id}/publish:
 *   post:
 *     tags: [Routine]
 *     summary: "Editor: publish (requires expert review)"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Published }, 409: { description: Review required } }
 * /routine/exercises/{id}/archive:
 *   post:
 *     tags: [Routine]
 *     summary: "Editor: archive"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Archived } }
 */
exerciseRouter.get("/", ...editor, validate(listEditorValidation), controller.list);
exerciseRouter.post("/", ...editor, validate(createExerciseValidation), controller.create);
exerciseRouter.get("/:id", ...editor, validate(idValidation), controller.get);
exerciseRouter.patch("/:id", ...editor, validate(updateExerciseValidation), controller.update);
exerciseRouter.post("/:id/review", authenticate, requireRole("admin"), validate(expertReviewValidation), controller.review);
exerciseRouter.post("/:id/publish", ...editor, validate(idValidation), controller.publish);
exerciseRouter.post("/:id/archive", ...editor, validate(idValidation), controller.archive);

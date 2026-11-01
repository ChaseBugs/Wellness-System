import { Router } from "express";
import type { AppCode } from "../../../../config/app-catalog.js";
import { fixedAppContext } from "../../../../middleware/app-context.js";
import { authenticate } from "../../../../middleware/auth.js";
import { validate } from "../../../../middleware/validate.js";
import { RoutineController } from "../controllers/routine-controller.js";
import { SessionController } from "../controllers/session-controller.js";
import { createRoutineService, createSessionService } from "../routine-factory.js";
import {
  completeSessionValidation,
  idValidation,
  listRoutinesValidation,
  startSessionValidation
} from "../validators/routine-validator.js";

const routineController = new RoutineController(createRoutineService());
const sessionController = new SessionController(createSessionService());

/**
 * The same player/timer/progress API mounted inside each routine app's module, scoped to that app.
 * Brands differ per app; the engine is shared (strategy: Workout, Yoga and Stretch reuse one engine).
 *
 * @openapi
 * /apps/{routineApp}/routines:
 *   get:
 *     tags: [Routine Apps]
 *     summary: Published routines of this app
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: routineApp, in: path, required: true, schema: { type: string, enum: [daily-workout, daily-yoga, height-increase] } }
 *       - { name: level, in: query, schema: { type: string } }
 *       - { name: tag, in: query, schema: { type: string } }
 *       - { name: goal, in: query, schema: { type: string } }
 *     responses: { 200: { description: Page of routines } }
 * /apps/{routineApp}/routines/{id}:
 *   get:
 *     tags: [Routine Apps]
 *     summary: Routine with steps (premium routines are `locked` without an entitlement)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: routineApp, in: path, required: true, schema: { type: string } }
 *       - { $ref: "#/components/parameters/Id" }
 *     responses: { 200: { description: Routine detail } }
 * /apps/{routineApp}/sessions:
 *   get:
 *     tags: [Routine Apps]
 *     summary: Session history in this app
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: routineApp, in: path, required: true, schema: { type: string } }]
 *     responses: { 200: { description: Page of sessions } }
 *   post:
 *     tags: [Routine Apps]
 *     summary: Start a session for a routine
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: routineApp, in: path, required: true, schema: { type: string } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [routineId], properties: { routineId: { type: string, format: uuid } } }
 *     responses: { 201: { description: Session started }, 403: { description: Entitlement required } }
 * /apps/{routineApp}/sessions/{id}/complete:
 *   post:
 *     tags: [Routine Apps]
 *     summary: Complete a session
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: routineApp, in: path, required: true, schema: { type: string } }
 *       - { $ref: "#/components/parameters/Id" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [completedSteps, durationSeconds]
 *             properties:
 *               completedSteps: { type: integer }
 *               durationSeconds: { type: integer }
 *               perceivedEffort: { type: integer, minimum: 1, maximum: 10 }
 *               notes: { type: string }
 *     responses: { 200: { description: Completed } }
 * /apps/{routineApp}/sessions/{id}/abandon:
 *   post:
 *     tags: [Routine Apps]
 *     summary: Abandon a session
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: routineApp, in: path, required: true, schema: { type: string } }
 *       - { $ref: "#/components/parameters/Id" }
 *     responses: { 200: { description: Abandoned } }
 * /apps/{routineApp}/progress:
 *   get:
 *     tags: [Routine Apps]
 *     summary: Streak, weekly totals and last 7 days (UTC days)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: routineApp, in: path, required: true, schema: { type: string } }]
 *     responses: { 200: { description: Progress } }
 */
export function createRoutineAppRouter(appCode: AppCode): Router {
  const router = Router();
  router.use(fixedAppContext(appCode));

  router.get("/routines", authenticate, validate(listRoutinesValidation), routineController.listPublished);
  router.get("/routines/:id", authenticate, validate(idValidation), routineController.getPublished);
  router.get("/sessions", authenticate, sessionController.list);
  router.post("/sessions", authenticate, validate(startSessionValidation), sessionController.start);
  router.post("/sessions/:id/complete", authenticate, validate(completeSessionValidation), sessionController.complete);
  router.post("/sessions/:id/abandon", authenticate, validate(idValidation), sessionController.abandon);
  router.get("/progress", authenticate, sessionController.progress);
  return router;
}

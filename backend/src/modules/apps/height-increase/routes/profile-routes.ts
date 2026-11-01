import { Router } from "express";
import { validate } from "../../../../middleware/validate.js";
import { HeightProfileController } from "../controllers/height-profile-controller.js";
import { createHeightProfileService } from "../height-factory.js";
import {
  createGoalValidation,
  listGoalsValidation,
  recordLogValidation,
  reportValidation,
  updateGoalValidation,
  updateProfileValidation
} from "../validators/height-app-validator.js";

const controller = new HeightProfileController(createHeightProfileService());

// Mounted after `authenticate`.
export const profileRouter = Router();

/**
 * @openapi
 * /apps/height-increase/profile:
 *   get:
 *     tags: [HeightIncrease]
 *     summary: Profile with latest measurement, active goals and the last 7 daily logs
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Profile }, 403: { description: HeightIncrease access blocked } }
 *   patch:
 *     tags: [HeightIncrease]
 *     summary: Update name, target height, birth date, gender, units, notifications, avatar
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               targetHeightCm: { type: number }
 *               birthDate: { type: string, format: date }
 *               gender: { type: string, enum: [male, female, other, prefer_not_to_say] }
 *               units: { type: string, enum: [metric, imperial] }
 *               notificationsEnabled: { type: boolean }
 *               avatarUrl: { type: string }
 *     responses: { 200: { description: Profile } }
 * /apps/height-increase/reports:
 *   get:
 *     tags: [HeightIncrease]
 *     summary: Workout and sleep summary over the latest logs
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: limit, in: query, schema: { type: integer, default: 30 } }]
 *     responses: { 200: { description: "{ summary, logs }" } }
 * /apps/height-increase/logs:
 *   post:
 *     tags: [HeightIncrease]
 *     summary: Save the day's log (same date updates it); heightCm also records a measurement
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date]
 *             properties:
 *               date: { type: string, format: date }
 *               heightCm: { type: number }
 *               weightKg: { type: number }
 *               sleepHours: { type: number }
 *               waterGlasses: { type: integer }
 *               mood: { type: string, enum: [great, good, okay, tired, bad] }
 *               workoutMinutes: { type: integer }
 *               completedExercises: { type: array, items: { type: object } }
 *               notes: { type: string }
 *     responses: { 201: { description: Log } }
 * /apps/height-increase/goals:
 *   get:
 *     tags: [HeightIncrease]
 *     summary: The user's goals
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: status, in: query, schema: { type: string, enum: [active, completed, cancelled] } }]
 *     responses: { 200: { description: Goals } }
 *   post:
 *     tags: [HeightIncrease]
 *     summary: Add a goal
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: Goal } }
 * /apps/height-increase/goals/{id}:
 *   patch:
 *     tags: [HeightIncrease]
 *     summary: Update progress or status
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Goal } }
 */
profileRouter.get("/profile", controller.get);
profileRouter.patch("/profile", validate(updateProfileValidation), controller.update);
profileRouter.get("/reports", validate(reportValidation), controller.report);
profileRouter.post("/logs", validate(recordLogValidation), controller.recordLog);
profileRouter.get("/goals", validate(listGoalsValidation), controller.listGoals);
profileRouter.post("/goals", validate(createGoalValidation), controller.createGoal);
profileRouter.patch("/goals/:id", validate(updateGoalValidation), controller.updateGoal);

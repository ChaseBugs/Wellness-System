import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { requireAppContext } from "../../../../middleware/app-context.js";
import { authenticate } from "../../../../middleware/auth.js";
import { validate } from "../../../../middleware/validate.js";
import { ReminderController } from "../controllers/reminder-controller.js";
import { ReminderRepository } from "../repositories/reminder-repository.js";
import { ReminderService } from "../services/reminder-service.js";
import { createReminderValidation, idValidation, updateReminderValidation } from "../validators/notification-validator.js";

const controller = new ReminderController(new ReminderService(new ReminderRepository(getPool())));

export const reminderRouter = Router();

/**
 * @openapi
 * /notifications/reminders:
 *   get:
 *     tags: [Notifications]
 *     summary: Reminders the user set in this app
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/AppCode" }]
 *     responses: { 200: { description: Reminders } }
 *   post:
 *     tags: [Notifications]
 *     summary: Create a timed reminder
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/AppCode" }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, timeOfDay]
 *             properties:
 *               title: { type: string, example: Evening yoga }
 *               body: { type: string }
 *               timeOfDay: { type: string, example: "20:30" }
 *               daysOfWeek: { type: array, items: { type: integer, minimum: 0, maximum: 6 } }
 *               timezone: { type: string, example: Asia/Seoul }
 *               deepLink: { type: string }
 *     responses: { 201: { description: Created } }
 * /notifications/reminders/{id}:
 *   patch:
 *     tags: [Notifications]
 *     summary: Update a reminder
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/AppCode" }, { $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Updated } }
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete a reminder
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/AppCode" }, { $ref: "#/components/parameters/Id" }]
 *     responses: { 204: { description: Deleted } }
 */
reminderRouter.get("/reminders", authenticate, requireAppContext, controller.list);
reminderRouter.post("/reminders", authenticate, requireAppContext, validate(createReminderValidation), controller.create);
reminderRouter.patch("/reminders/:id", authenticate, requireAppContext, validate(updateReminderValidation), controller.update);
reminderRouter.delete("/reminders/:id", authenticate, requireAppContext, validate(idValidation), controller.delete);

import { Router } from "express";
import { query } from "express-validator";
import { APP_CODES } from "../../../../config/app-catalog.js";
import { authenticate, requireRole } from "../../../../middleware/auth.js";
import { validate } from "../../../../middleware/validate.js";
import { PushController } from "../controllers/push-controller.js";
import { DELIVERY_SOURCES, DELIVERY_STATUSES } from "../models/push.js";
import { createPushDispatchService } from "../push-factory.js";

const controller = new PushController(createPushDispatchService());
const admin = [authenticate, requireRole("admin")];

const deliveriesValidation = [
  query("appCode").optional().isIn(APP_CODES),
  query("source").optional().isIn(DELIVERY_SOURCES),
  query("status").optional().isIn(DELIVERY_STATUSES),
  query("limit").optional().isInt({ min: 1, max: 500 })
];

export const pushRouter = Router();

/**
 * @openapi
 * /notifications/dispatch:
 *   post:
 *     tags: [Notifications]
 *     summary: Send due reminders now (admin; the scheduler does this every tick)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: "Counts of claimed, sent, no-device and failed deliveries" } }
 * /notifications/deliveries:
 *   get:
 *     tags: [Notifications]
 *     summary: Recent push deliveries (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: appCode, schema: { type: string } }
 *       - { in: query, name: source, schema: { type: string, enum: [reminder, campaign] } }
 *       - { in: query, name: status, schema: { type: string, enum: [pending, sent, no_device, failed] } }
 *       - { in: query, name: limit, schema: { type: integer, maximum: 500 } }
 *     responses: { 200: { description: Deliveries, newest first } }
 */
pushRouter.post("/dispatch", ...admin, controller.dispatch);
pushRouter.get("/deliveries", ...admin, validate(deliveriesValidation), controller.deliveries);

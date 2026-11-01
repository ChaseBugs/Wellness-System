import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { requireAppContext } from "../../../../middleware/app-context.js";
import { authenticate } from "../../../../middleware/auth.js";
import { validate } from "../../../../middleware/validate.js";
import { DeviceController } from "../controllers/device-controller.js";
import { DeviceRepository } from "../repositories/device-repository.js";
import { DeviceService } from "../services/device-service.js";
import { idValidation, registerDeviceValidation } from "../validators/notification-validator.js";

const controller = new DeviceController(new DeviceService(new DeviceRepository(getPool())));

export const deviceRouter = Router();

/**
 * @openapi
 * /notifications/devices:
 *   get:
 *     tags: [Notifications]
 *     summary: Push devices registered for this app
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/AppCode" }]
 *     responses: { 200: { description: Devices } }
 *   post:
 *     tags: [Notifications]
 *     summary: Register or refresh a push token
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/AppCode" }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [platform, pushToken]
 *             properties: { platform: { type: string, enum: [ios, android, web] }, pushToken: { type: string } }
 *     responses: { 201: { description: Registered } }
 * /notifications/devices/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Unregister a device (e.g. on sign-out)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 204: { description: Removed } }
 */
deviceRouter.get("/devices", authenticate, requireAppContext, controller.list);
deviceRouter.post("/devices", authenticate, requireAppContext, validate(registerDeviceValidation), controller.register);
deviceRouter.delete("/devices/:id", authenticate, validate(idValidation), controller.unregister);

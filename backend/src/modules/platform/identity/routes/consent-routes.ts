import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { authenticate } from "../../../../middleware/auth.js";
import { validate } from "../../../../middleware/validate.js";
import { ConsentController } from "../controllers/consent-controller.js";
import { ConsentRepository } from "../repositories/consent-repository.js";
import { ConsentService } from "../services/consent-service.js";
import { consentIdValidation, createConsentValidation } from "../validators/consent-validator.js";

const consentController = new ConsentController(new ConsentService(new ConsentRepository(getPool())));

export const consentRouter = Router();

/**
 * @openapi
 * /consents:
 *   get:
 *     tags: [Identity]
 *     summary: Active cross-app data-sharing consents
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Consents } }
 *   post:
 *     tags: [Identity]
 *     summary: Allow targetApp to read a summary scope from sourceApp
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sourceApp, targetApp, scope]
 *             properties:
 *               sourceApp: { type: string, example: daily-workout }
 *               targetApp: { type: string, example: foodvisor }
 *               scope: { type: string, enum: [goals, activity_summary, nutrition_summary, growth_summary] }
 *     responses: { 201: { description: Consent granted } }
 * /consents/{id}:
 *   delete:
 *     tags: [Identity]
 *     summary: Revoke a consent
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 204: { description: Revoked } }
 */
consentRouter.get("/", authenticate, consentController.list);
consentRouter.post("/", authenticate, validate(createConsentValidation), consentController.grant);
consentRouter.delete("/:id", authenticate, validate(consentIdValidation), consentController.revoke);

import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { authenticate } from "../../../../middleware/auth.js";
import { validate } from "../../../../middleware/validate.js";
import { EntitlementController } from "../controllers/entitlement-controller.js";
import { PlanRepository } from "../repositories/plan-repository.js";
import { PurchaseRepository } from "../repositories/purchase-repository.js";
import { EntitlementService } from "../services/entitlement-service.js";
import { eligibilityValidation } from "../validators/purchase-validator.js";

const pool = getPool();
const entitlementController = new EntitlementController(
  new EntitlementService(new PurchaseRepository(pool), new PlanRepository(pool))
);

export const entitlementRouter = Router();

/**
 * @openapi
 * /subscriptions/entitlements:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Which apps this account has premium access to, from any app or store
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Entitlement summary } }
 * /subscriptions/eligibility:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Check before purchase that the plan is not already covered (prevents duplicate subscriptions)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: planCode, in: query, required: true, schema: { type: string, example: wellness_pass_monthly } }
 *     responses: { 200: { description: Eligibility } }
 */
entitlementRouter.get("/entitlements", authenticate, entitlementController.summary);
entitlementRouter.get("/eligibility", authenticate, validate(eligibilityValidation), entitlementController.eligibility);

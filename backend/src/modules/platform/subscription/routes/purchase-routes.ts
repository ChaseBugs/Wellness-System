import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { optionalAppContext } from "../../../../middleware/app-context.js";
import { authenticate } from "../../../../middleware/auth.js";
import { validate } from "../../../../middleware/validate.js";
import { PurchaseController } from "../controllers/purchase-controller.js";
import { createStoreVerifiers } from "../providers/store-verifiers.js";
import { PlanRepository } from "../repositories/plan-repository.js";
import { PurchaseRepository } from "../repositories/purchase-repository.js";
import { EntitlementService } from "../services/entitlement-service.js";
import { PurchaseService } from "../services/purchase-service.js";
import { restorePurchasesValidation, verifyPurchaseValidation, webhookValidation } from "../validators/purchase-validator.js";

const pool = getPool();
const planRepository = new PlanRepository(pool);
const purchaseRepository = new PurchaseRepository(pool);
const purchaseController = new PurchaseController(
  new PurchaseService(
    planRepository,
    purchaseRepository,
    createStoreVerifiers(),
    new EntitlementService(purchaseRepository, planRepository)
  )
);

export const purchaseRouter = Router();

/**
 * @openapi
 * /subscriptions/purchases:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Purchase history for this account
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Purchases } }
 * /subscriptions/purchases/verify:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Verify a store purchase server-side and grant entitlements
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/AppCodeOptional" }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [store, productId, purchaseToken]
 *             properties:
 *               store: { type: string, enum: [apple, google, dev] }
 *               productId: { type: string, example: dev.wellness_pass.monthly }
 *               purchaseToken: { type: string, description: Apple transaction id / Google purchase token }
 *     responses:
 *       201: { description: Purchase recorded with updated entitlements }
 *       409: { description: Purchase belongs to another account }
 *       501: { description: Store verification not configured yet }
 * /subscriptions/purchases/restore:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Restore purchases made in any app under this account
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/AppCodeOptional" }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [purchases]
 *             properties:
 *               purchases:
 *                 type: array
 *                 items: { type: object, properties: { store: { type: string }, productId: { type: string }, purchaseToken: { type: string } } }
 *     responses: { 200: { description: Restored purchases and entitlements } }
 * /subscriptions/webhooks/{store}:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Store server notifications (renewal, refund, expiry); authenticated by the store verifier
 *     parameters: [{ name: store, in: path, required: true, schema: { type: string, enum: [apple, google, dev] } }]
 *     responses: { 200: { description: Notification processed } }
 */
purchaseRouter.get("/purchases", authenticate, purchaseController.list);
purchaseRouter.post("/purchases/verify", authenticate, optionalAppContext, validate(verifyPurchaseValidation), purchaseController.verify);
purchaseRouter.post("/purchases/restore", authenticate, optionalAppContext, validate(restorePurchasesValidation), purchaseController.restore);
purchaseRouter.post("/webhooks/:store", validate(webhookValidation), purchaseController.webhook);

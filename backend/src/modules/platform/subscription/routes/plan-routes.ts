import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { validate } from "../../../../middleware/validate.js";
import { PlanController } from "../controllers/plan-controller.js";
import { PlanRepository } from "../repositories/plan-repository.js";
import { PlanService } from "../services/plan-service.js";
import { listPlansValidation } from "../validators/purchase-validator.js";

const planController = new PlanController(new PlanService(new PlanRepository(getPool())));

export const planRouter = Router();

/**
 * @openapi
 * /subscriptions/plans:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Free / App Pro / Wellness Pass plans with their store product ids
 *     parameters:
 *       - { name: app, in: query, schema: { type: string }, description: Only plans that unlock this app }
 *     responses: { 200: { description: Plans } }
 */
planRouter.get("/plans", validate(listPlansValidation), planController.list);

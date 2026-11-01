import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { authenticate, requireRole } from "../../../../middleware/auth.js";
import { validate } from "../../../../middleware/validate.js";
import { KpiController } from "../controllers/kpi-controller.js";
import { EventRepository } from "../repositories/event-repository.js";
import { KpiService } from "../services/kpi-service.js";
import { kpiSummaryValidation } from "../validators/kpi-validator.js";

const kpiController = new KpiController(new KpiService(new EventRepository(getPool())));

export const kpiRouter = Router();

/**
 * @openapi
 * /analytics/kpis:
 *   get:
 *     tags: [Analytics]
 *     summary: "Admin: active users, top events and D1/D7/D30 retention for one app"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: app, in: query, required: true, schema: { type: string } }
 *       - { name: from, in: query, required: true, schema: { type: string, format: date } }
 *       - { name: to, in: query, required: true, schema: { type: string, format: date } }
 *     responses: { 200: { description: KPI summary } }
 */
kpiRouter.get("/kpis", authenticate, requireRole("admin"), validate(kpiSummaryValidation), kpiController.summary);

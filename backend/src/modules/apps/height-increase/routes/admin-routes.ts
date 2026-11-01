import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { authenticate, requireRole } from "../../../../middleware/auth.js";
import { createResourceRouter, createResourceService } from "../../../../shared/resource-kit/resource-router.js";
import { createRoutineService } from "../../../platform/routine/routine-factory.js";
import { HEIGHT_ADMIN_RESOURCES, trainingPlansResource } from "../admin/height-resources.js";
import { param } from "express-validator";
import { validate } from "../../../../middleware/validate.js";
import { HeightAdminController } from "../controllers/height-admin-controller.js";
import { createHeightCampaignService } from "../height-factory.js";
import { HeightAdminStatsRepository } from "../repositories/height-admin-stats-repository.js";
import { HeightAdminService } from "../services/height-admin-service.js";

const resourceService = createResourceService();
const editorGuards = [authenticate, requireRole("editor", "admin")];
const controller = new HeightAdminController(
  new HeightAdminService(new HeightAdminStatsRepository(getPool()), resourceService, trainingPlansResource, createRoutineService()),
  createHeightCampaignService()
);

export const adminRouter = Router();

/**
 * Admin CRUD for the HeightIncrease web-admin (Resource kit list contract, legacy field names).
 * Exercises and training plans go live only through the Routine Engine review workflow:
 * POST /routine/exercises/{id}/review (admin), POST /routine/exercises/{id}/publish, and the same under /routine/routines.
 *
 * @openapi
 * /apps/height-increase/admin/stats:
 *   get:
 *     tags: [HeightIncrease]
 *     summary: "Editor: totals, latest logs and 14-day workout/sleep trend"
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Dashboard } }
 * /apps/height-increase/admin/{resource}:
 *   get:
 *     tags: [HeightIncrease]
 *     summary: "Editor: list a resource"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: resource
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [users, exercises, training-plans, articles, banners, notifications, goals, logs, settings]
 *       - { name: q, in: query, schema: { type: string } }
 *       - { name: sort, in: query, schema: { type: string, example: -createdAt } }
 *       - { $ref: "#/components/parameters/Page" }
 *       - { name: limit, in: query, schema: { type: integer, maximum: 500 } }
 *     responses: { 200: { description: "{ items, total, page, limit }" } }
 *   post:
 *     tags: [HeightIncrease]
 *     summary: "Editor: create (exercises and plans start as unreviewed drafts; not for users)"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: resource, in: path, required: true, schema: { type: string } }]
 *     responses: { 201: { description: Created } }
 * /apps/height-increase/admin/{resource}/{id}:
 *   get:
 *     tags: [HeightIncrease]
 *     summary: "Editor: read one"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: resource, in: path, required: true, schema: { type: string } }, { $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Record } }
 *   patch:
 *     tags: [HeightIncrease]
 *     summary: "Editor: update; training plans accept `exercises: [{ exercise, order, durationSeconds, sets, reps, restSeconds }]`"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: resource, in: path, required: true, schema: { type: string } }, { $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Updated } }
 *   delete:
 *     tags: [HeightIncrease]
 *     summary: "Editor: delete"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: resource, in: path, required: true, schema: { type: string } }, { $ref: "#/components/parameters/Id" }]
 *     responses: { 204: { description: Deleted } }
 */
adminRouter.get("/stats", ...editorGuards, controller.stats);

/**
 * @openapi
 * /apps/height-increase/admin/notifications/{id}/send:
 *   post:
 *     tags: [HeightIncrease Admin]
 *     summary: Send a push campaign now (admin; once per campaign)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses:
 *       200: { description: "Recipients and delivery counts" }
 *       409: { description: Already sent, or inactive }
 */
adminRouter.post("/notifications/:id/send", authenticate, requireRole("admin"), validate([param("id").isUUID()]), controller.sendCampaign);
// Training plans carry their exercise list; these run before the kit's own create/update.
adminRouter.post("/training-plans", ...editorGuards, controller.createPlan);
adminRouter.put("/training-plans/:id", ...editorGuards, controller.updatePlan);
adminRouter.patch("/training-plans/:id", ...editorGuards, controller.updatePlan);
for (const resource of HEIGHT_ADMIN_RESOURCES) {
  adminRouter.use(`/${resource.name}`, createResourceRouter(resource, editorGuards, resourceService));
}

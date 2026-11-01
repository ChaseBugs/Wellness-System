import { Router } from "express";
import { authenticate, requireRole } from "../../../../middleware/auth.js";
import { AdminDashboardController } from "../../../../shared/resource-kit/admin-dashboard-controller.js";
import { AdminDashboardService } from "../../../../shared/resource-kit/admin-dashboard-service.js";
import { createResourceRouter, createResourceService } from "../../../../shared/resource-kit/resource-router.js";
import { BABYGROW_ADMIN_RESOURCES } from "../admin/babygrow-resources.js";

const resourceService = createResourceService();
const editorGuards = [authenticate, requireRole("editor", "admin")];
const dashboardController = new AdminDashboardController(new AdminDashboardService(resourceService, BABYGROW_ADMIN_RESOURCES));

export const adminRouter = Router();

/**
 * Admin CRUD for the TalentBaby web-admin, served by the Resource kit (same list contract as Foodvisor).
 * Library resources are BabyGrow's slice of the Content Factory; `expertReviewed` is the admin-only
 * review flag (bulk: `PATCH /{resource}/bulk-verify { ids, doctorVerified }`).
 *
 * @openapi
 * /apps/babygrow/admin/dashboard:
 *   get:
 *     tags: [BabyGrow]
 *     summary: "Editor: totals, unreviewed counts, recent additions and 30-day trend"
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Dashboard } }
 * /apps/babygrow/admin/{resource}:
 *   get:
 *     tags: [BabyGrow]
 *     summary: "Editor: list a resource"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: resource
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [activities, milestone-definitions, recipes, stories, articles, daily-updates, guides, children, parents]
 *       - { name: q, in: query, schema: { type: string } }
 *       - { name: sort, in: query, schema: { type: string, example: -createdAt } }
 *       - { $ref: "#/components/parameters/Page" }
 *       - { name: limit, in: query, schema: { type: integer, maximum: 500 } }
 *     responses: { 200: { description: "{ items, total, page, limit }" } }
 *   post:
 *     tags: [BabyGrow]
 *     summary: "Editor: create (expertReviewed is forced false; not for children or parents)"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: resource, in: path, required: true, schema: { type: string } }]
 *     responses: { 201: { description: Created } }
 * /apps/babygrow/admin/{resource}/{id}:
 *   get:
 *     tags: [BabyGrow]
 *     summary: "Editor: read one"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: resource, in: path, required: true, schema: { type: string } }, { $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Record } }
 *   put:
 *     tags: [BabyGrow]
 *     summary: "Editor: update (only admins may change expertReviewed)"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: resource, in: path, required: true, schema: { type: string } }, { $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Updated } }
 *   delete:
 *     tags: [BabyGrow]
 *     summary: "Editor: delete"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: resource, in: path, required: true, schema: { type: string } }, { $ref: "#/components/parameters/Id" }]
 *     responses: { 204: { description: Deleted } }
 */
adminRouter.get("/dashboard", ...editorGuards, dashboardController.summary);
for (const resource of BABYGROW_ADMIN_RESOURCES) {
  adminRouter.use(`/${resource.name}`, createResourceRouter(resource, editorGuards, resourceService));
}

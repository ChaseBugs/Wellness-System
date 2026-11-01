import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { authenticate, requireRole } from "../../../../middleware/auth.js";
import { createResourceRouter, createResourceService } from "../../../../shared/resource-kit/resource-router.js";
import { accountsResource, PLATFORM_ADMIN_RESOURCES } from "../admin-resources.js";
import { PlatformAdminController } from "../controllers/platform-admin-controller.js";
import { AdminOverviewRepository } from "../repositories/admin-overview-repository.js";
import { PlatformAdminService } from "../services/platform-admin-service.js";

const resourceService = createResourceService();
const adminGuards = [authenticate, requireRole("admin")];
const controller = new PlatformAdminController(new PlatformAdminService(new AdminOverviewRepository(getPool()), resourceService, accountsResource));

export const platformAdminRouter = Router();

/**
 * Platform pages of the unified Wellness admin. Admins only.
 *
 * @openapi
 * /admin/overview:
 *   get:
 *     tags: [Admin]
 *     summary: "Admin: accounts, active subscriptions, review backlog and installs per app"
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Overview } }
 * /admin/{resource}:
 *   get:
 *     tags: [Admin]
 *     summary: "Admin: list accounts, purchases, plans or the audit log (Resource kit list contract)"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: resource
 *         in: path
 *         required: true
 *         schema: { type: string, enum: [accounts, purchases, plans, audit-logs] }
 *       - { name: q, in: query, schema: { type: string } }
 *       - { name: sort, in: query, schema: { type: string } }
 *       - { $ref: "#/components/parameters/Page" }
 *     responses: { 200: { description: "{ items, total, page, limit }" } }
 * /admin/accounts/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: "Admin: change an account's display name or role (user, editor, admin); not your own role"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { type: object, properties: { displayName: { type: string }, role: { type: string, enum: [user, editor, admin] } } }
 *     responses: { 200: { description: Account }, 403: { description: Own role } }
 */
platformAdminRouter.get("/overview", ...adminGuards, controller.overview);
platformAdminRouter.put("/accounts/:id", ...adminGuards, controller.updateAccount);
platformAdminRouter.patch("/accounts/:id", ...adminGuards, controller.updateAccount);
for (const resource of PLATFORM_ADMIN_RESOURCES) {
  platformAdminRouter.use(`/${resource.name}`, createResourceRouter(resource, adminGuards, resourceService));
}

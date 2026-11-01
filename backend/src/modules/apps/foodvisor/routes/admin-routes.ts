import { Router } from "express";
import { authenticate, requireRole } from "../../../../middleware/auth.js";
import { validate } from "../../../../middleware/validate.js";
import { createResourceRouter, createResourceService } from "../../../../shared/resource-kit/resource-router.js";
import { FOODVISOR_ADMIN_RESOURCES } from "../admin/foodvisor-resources.js";
import { AdminDashboardController } from "../../../../shared/resource-kit/admin-dashboard-controller.js";
import { AdminDashboardService } from "../../../../shared/resource-kit/admin-dashboard-service.js";
import { idValidation } from "../validators/foodvisor-validator.js";
import { humanTypeController } from "./human-type-routes.js";

const resourceService = createResourceService();
const editorGuards = [authenticate, requireRole("editor", "admin")];
const dashboardController = new AdminDashboardController(new AdminDashboardService(resourceService, FOODVISOR_ADMIN_RESOURCES));

export const adminRouter = Router();

/**
 * Admin CRUD for every Foodvisor resource, served by the Resource kit with the legacy contract:
 * `GET ?q=&page=&limit=&sort=-field&field=a,b&field_gte=`, `GET|PUT|PATCH|DELETE /:id`, `POST /`,
 * `PATCH /bulk-verify { ids, doctorVerified }`, `DELETE /bulk { ids }`.
 *
 * @openapi
 * /apps/foodvisor/admin/dashboard:
 *   get:
 *     tags: [Foodvisor]
 *     summary: "Editor: totals, unverified counts, recent additions and 30-day trend"
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Dashboard } }
 * /apps/foodvisor/admin/{resource}:
 *   get:
 *     tags: [Foodvisor]
 *     summary: "Editor: list a reference resource"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: resource
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [foods, users, meal-logs, weight-entries, activities, programs, recipe-ingredients, reference-sources, nutrient-intake-rules, condition-diet-conditions, condition-diet-rules, risk-assessment-rules, nutrition-terminology, data-validation-rules, daily-value-profiles, nutrition-constraints, human-type-qa, human-type-surveys]
 *       - { name: q, in: query, schema: { type: string } }
 *       - { name: sort, in: query, schema: { type: string, example: -createdAt } }
 *       - { $ref: "#/components/parameters/Page" }
 *       - { name: limit, in: query, schema: { type: integer, maximum: 500 } }
 *     responses: { 200: { description: "{ items, total, page, limit }" } }
 *   post:
 *     tags: [Foodvisor]
 *     summary: "Editor: create (doctorVerified is forced false)"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: resource, in: path, required: true, schema: { type: string } }]
 *     responses: { 201: { description: Created } }
 * /apps/foodvisor/admin/{resource}/{id}:
 *   get:
 *     tags: [Foodvisor]
 *     summary: "Editor: read one"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: resource, in: path, required: true, schema: { type: string } }, { $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Record } }
 *   put:
 *     tags: [Foodvisor]
 *     summary: "Editor: update (only admins may change doctorVerified)"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: resource, in: path, required: true, schema: { type: string } }, { $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Updated } }
 *   delete:
 *     tags: [Foodvisor]
 *     summary: "Editor: delete"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: resource, in: path, required: true, schema: { type: string } }, { $ref: "#/components/parameters/Id" }]
 *     responses: { 204: { description: Deleted } }
 * /apps/foodvisor/admin/{resource}/bulk-verify:
 *   patch:
 *     tags: [Foodvisor]
 *     summary: "Admin: set doctorVerified on up to 500 rows"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: resource, in: path, required: true, schema: { type: string } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, properties: { ids: { type: array, items: { type: string } }, doctorVerified: { type: boolean } } }
 *     responses: { 200: { description: "{ matched, modified }" } }
 * /apps/foodvisor/admin/{resource}/bulk:
 *   delete:
 *     tags: [Foodvisor]
 *     summary: "Editor: delete up to 500 rows"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: resource, in: path, required: true, schema: { type: string } }]
 *     responses: { 200: { description: "{ deleted }" } }
 * /apps/foodvisor/admin/human-type-surveys/{id}/reclassify:
 *   post:
 *     tags: [Foodvisor]
 *     summary: "Editor: re-score a stored survey with the current questionnaire"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Survey } }
 */
adminRouter.get("/dashboard", ...editorGuards, dashboardController.summary);
adminRouter.post("/human-type-surveys/:id/reclassify", ...editorGuards, validate(idValidation), humanTypeController.reclassify);
for (const resource of FOODVISOR_ADMIN_RESOURCES) {
  adminRouter.use(`/${resource.name}`, createResourceRouter(resource, editorGuards, resourceService));
}

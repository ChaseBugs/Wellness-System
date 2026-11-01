import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { authenticate, optionalAuthenticate, requireRole } from "../../../../middleware/auth.js";
import { validate } from "../../../../middleware/validate.js";
import { createEntitlementChecker } from "../../subscription/entitlement-factory.js";
import { ContentItemController } from "../controllers/content-item-controller.js";
import { ContentItemRepository } from "../repositories/content-item-repository.js";
import { ContentItemService } from "../services/content-item-service.js";
import {
  contentIdValidation,
  createContentValidation,
  listContentValidation,
  reviewContentValidation,
  updateContentValidation
} from "../validators/content-item-validator.js";

const controller = new ContentItemController(
  new ContentItemService(new ContentItemRepository(getPool()), createEntitlementChecker())
);
const editor = [authenticate, requireRole("editor", "admin")];

export const contentItemRouter = Router();

/**
 * @openapi
 * /content:
 *   get:
 *     tags: [Content]
 *     summary: Published content across apps (summaries)
 *     parameters:
 *       - { name: app, in: query, schema: { type: string } }
 *       - { name: type, in: query, schema: { type: string, enum: [recipe, exercise_guide, yoga_pose, article, tutorial, meditation_audio, milestone_guide] } }
 *       - { name: category, in: query, schema: { type: string } }
 *       - { name: tag, in: query, schema: { type: string } }
 *       - { name: q, in: query, schema: { type: string } }
 *       - { name: maxMinutes, in: query, schema: { type: integer } }
 *       - { name: excludeAllergens, in: query, schema: { type: string }, description: Comma-separated }
 *       - { $ref: "#/components/parameters/Page" }
 *       - { $ref: "#/components/parameters/Limit" }
 *     responses: { 200: { description: Page of content summaries } }
 * /content/{id}:
 *   get:
 *     tags: [Content]
 *     summary: Published item detail; premium items are `locked` without an entitlement
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Content detail }, 404: { description: Not found } }
 * /content/manage/items:
 *   get:
 *     tags: [Content]
 *     summary: "Editor: list content in any review status"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: status, in: query, schema: { type: string, enum: [draft, in_review, approved, published, archived] } }
 *       - { $ref: "#/components/parameters/Page" }
 *     responses: { 200: { description: Page of content } }
 *   post:
 *     tags: [Content]
 *     summary: "Editor: create a draft (always starts unreviewed)"
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contentType, title, appCodes]
 *             properties:
 *               contentType: { type: string }
 *               title: { type: string }
 *               appCodes: { type: array, items: { type: string } }
 *               summary: { type: string }
 *               steps: { type: array, items: { type: object, properties: { text: { type: string } } } }
 *               attributes: { type: object, description: "Recipe: { servings, ingredients[], nutritionPerServing, allergens[] }" }
 *               isPremium: { type: boolean }
 *     responses: { 201: { description: Draft created } }
 * /content/manage/items/{id}:
 *   get:
 *     tags: [Content]
 *     summary: "Editor: item in any status"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Content } }
 *   patch:
 *     tags: [Content]
 *     summary: "Editor: edit (non-draft items go back to review)"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Updated } }
 * /content/manage/items/{id}/submit:
 *   post:
 *     tags: [Content]
 *     summary: "Editor: draft -> in_review"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Submitted } }
 * /content/manage/items/{id}/review:
 *   post:
 *     tags: [Content]
 *     summary: "Admin (expert reviewer): approve or return to draft"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [approve], properties: { approve: { type: boolean }, notes: { type: string } } }
 *     responses: { 200: { description: Reviewed } }
 * /content/manage/items/{id}/publish:
 *   post:
 *     tags: [Content]
 *     summary: "Editor: approved -> published"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Published } }
 * /content/manage/items/{id}/archive:
 *   post:
 *     tags: [Content]
 *     summary: "Editor: archive (unpublishes)"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Archived } }
 */
contentItemRouter.get("/manage/items", ...editor, validate(listContentValidation), controller.listForEditor);
contentItemRouter.post("/manage/items", ...editor, validate(createContentValidation), controller.create);
contentItemRouter.get("/manage/items/:id", ...editor, validate(contentIdValidation), controller.getForEditor);
contentItemRouter.patch("/manage/items/:id", ...editor, validate(updateContentValidation), controller.update);
contentItemRouter.post("/manage/items/:id/submit", ...editor, validate(contentIdValidation), controller.submit);
contentItemRouter.post("/manage/items/:id/review", authenticate, requireRole("admin"), validate(reviewContentValidation), controller.review);
contentItemRouter.post("/manage/items/:id/publish", ...editor, validate(contentIdValidation), controller.publish);
contentItemRouter.post("/manage/items/:id/archive", ...editor, validate(contentIdValidation), controller.archive);

contentItemRouter.get("/", validate(listContentValidation), controller.listPublished);
contentItemRouter.get("/:id", optionalAuthenticate, validate(contentIdValidation), controller.getPublished);

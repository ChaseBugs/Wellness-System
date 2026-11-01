import { Router } from "express";
import { validate } from "../../../../middleware/validate.js";
import { createChildService } from "../babygrow-factory.js";
import { ChildController } from "../controllers/child-controller.js";
import {
  addCaregiverValidation,
  childIdValidation,
  createChildValidation,
  removeCaregiverValidation,
  updateChildValidation
} from "../validators/babygrow-validator.js";

const controller = new ChildController(createChildService());

export const childRouter = Router();

/**
 * @openapi
 * /apps/babygrow/children:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Children the user cares for (own or shared)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Children } }
 *   post:
 *     tags: [BabyGrow]
 *     summary: Add a child profile (caller becomes owner)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, birthDate]
 *             properties:
 *               name: { type: string }
 *               birthDate: { type: string, format: date }
 *               sex: { type: string, enum: [female, male, unspecified] }
 *     responses: { 201: { description: Created } }
 * /apps/babygrow/children/{childId}:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Child profile
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: childId, in: path, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Child } }
 *   patch:
 *     tags: [BabyGrow]
 *     summary: "Update (editor or owner); PUT is an alias"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: childId, in: path, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Updated } }
 *   delete:
 *     tags: [BabyGrow]
 *     summary: "Delete the child and all records (owner only)"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: childId, in: path, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 204: { description: Deleted } }
 * /apps/babygrow/children/{childId}/caregivers:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Caregivers who can see this child
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: childId, in: path, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Caregivers } }
 *   post:
 *     tags: [BabyGrow]
 *     summary: "Share with another Wellness account (owner only)"
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: childId, in: path, required: true, schema: { type: string, format: uuid } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, role]
 *             properties: { email: { type: string }, role: { type: string, enum: [editor, viewer] } }
 *     responses: { 201: { description: Caregiver added } }
 * /apps/babygrow/children/{childId}/caregivers/{userId}:
 *   delete:
 *     tags: [BabyGrow]
 *     summary: Remove a caregiver (owner) or leave (self)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: childId, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { name: userId, in: path, required: true, schema: { type: string, format: uuid } }
 *     responses: { 204: { description: Removed } }
 */
childRouter.get("/", controller.list);
childRouter.post("/", validate(createChildValidation), controller.create);
childRouter.get("/:childId", validate(childIdValidation), controller.get);
childRouter.patch("/:childId", validate(updateChildValidation), controller.update);
childRouter.put("/:childId", validate(updateChildValidation), controller.update);
childRouter.delete("/:childId", validate(childIdValidation), controller.delete);
childRouter.get("/:childId/caregivers", validate(childIdValidation), controller.listCaregivers);
childRouter.post("/:childId/caregivers", validate(addCaregiverValidation), controller.addCaregiver);
childRouter.delete("/:childId/caregivers/:userId", validate(removeCaregiverValidation), controller.removeCaregiver);

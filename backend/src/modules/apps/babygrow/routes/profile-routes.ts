import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { validate } from "../../../../middleware/validate.js";
import { UserRepository } from "../../../platform/identity/repositories/user-repository.js";
import { createChildService } from "../babygrow-factory.js";
import { ProfileController } from "../controllers/profile-controller.js";
import { ParentProfileRepository } from "../repositories/parent-profile-repository.js";
import { ParentProfileService } from "../services/parent-profile-service.js";
import { setActiveChildValidation, updateProfileValidation } from "../validators/babygrow-validator.js";

const pool = getPool();
const controller = new ProfileController(new ParentProfileService(new ParentProfileRepository(pool), new UserRepository(pool)), createChildService());

export const profileRouter = Router();

/**
 * @openapi
 * /apps/babygrow/profile:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Caregiver profile (account name and language plus BabyGrow-only fields)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Profile } }
 *   put:
 *     tags: [BabyGrow]
 *     summary: Update the caregiver profile
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *               languagePreference: { type: string }
 *               phoneNumber: { type: string }
 *               gender: { type: string, enum: [female, male, other, prefer_not_to_say] }
 *               birthdate: { type: string, format: date }
 *               profilePictureUrl: { type: string }
 *               relationToBaby: { type: string }
 *     responses: { 200: { description: Profile } }
 * /apps/babygrow/profile/active-child:
 *   get:
 *     tags: [BabyGrow]
 *     summary: The child the app opens on (falls back to the first child)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: "Child or null" } }
 *   put:
 *     tags: [BabyGrow]
 *     summary: Switch the active child
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [childId], properties: { childId: { type: string, format: uuid } } }
 *     responses: { 200: { description: Child } }
 */
profileRouter.get("/", controller.get);
profileRouter.put("/", validate(updateProfileValidation), controller.update);
profileRouter.get("/active-child", controller.activeChild);
profileRouter.put("/active-child", validate(setActiveChildValidation), controller.setActiveChild);

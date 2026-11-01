import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { validate } from "../../../../middleware/validate.js";
import { ProfileController } from "../controllers/profile-controller.js";
import { ProfileRepository } from "../repositories/profile-repository.js";
import { ProgramRepository } from "../repositories/program-repository.js";
import { WeightEntryRepository } from "../repositories/weight-entry-repository.js";
import { ProfileService } from "../services/profile-service.js";
import { ProgramService } from "../services/program-service.js";
import { WeightEntryService } from "../services/weight-entry-service.js";
import { idValidation, recordWeightValidation, upsertProfileValidation } from "../validators/foodvisor-validator.js";

const pool = getPool();
const profileRepository = new ProfileRepository(pool);
const controller = new ProfileController(
  new ProfileService(profileRepository),
  new WeightEntryService(new WeightEntryRepository(pool), profileRepository),
  new ProgramService(new ProgramRepository(pool))
);

export const programPublicRouter = Router();
export const profileRouter = Router();

/**
 * @openapi
 * /apps/foodvisor/programs:
 *   get:
 *     tags: [Foodvisor]
 *     summary: Onboarding/coaching program steps (no auth)
 *     responses: { 200: { description: Programs } }
 * /apps/foodvisor/profile:
 *   get:
 *     tags: [Foodvisor]
 *     summary: The user's Foodvisor profile (null before onboarding)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Profile or null } }
 *   put:
 *     tags: [Foodvisor]
 *     summary: Create or update the profile (partial updates keep other fields)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               goal: { type: string }
 *               gender: { type: string, enum: [male, female, non_binary] }
 *               age: { type: integer }
 *               heightCm: { type: number }
 *               currentWeightKg: { type: number }
 *               targetWeightKg: { type: number }
 *               activityLevel: { type: string, enum: [sedentary, low_active, active, very_active] }
 *               dietaryRestrictions: { type: array, items: { type: string } }
 *               medicalConditions: { type: array, items: { type: string } }
 *               programStage: { type: string }
 *     responses: { 200: { description: Profile } }
 * /apps/foodvisor/weight-entries:
 *   get:
 *     tags: [Foodvisor]
 *     summary: Weight history (newest first) with change and target
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: History } }
 *   post:
 *     tags: [Foodvisor]
 *     summary: Record a weight (one per day; same date replaces)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [measuredOn, weightKg], properties: { measuredOn: { type: string, format: date }, weightKg: { type: number }, note: { type: string } } }
 *     responses: { 201: { description: Recorded } }
 * /apps/foodvisor/weight-entries/{id}:
 *   delete:
 *     tags: [Foodvisor]
 *     summary: Delete a weight entry
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 204: { description: Deleted } }
 */
programPublicRouter.get("/programs", controller.programs);

profileRouter.get("/profile", controller.getProfile);
profileRouter.put("/profile", validate(upsertProfileValidation), controller.upsertProfile);
profileRouter.get("/weight-entries", controller.weightHistory);
profileRouter.post("/weight-entries", validate(recordWeightValidation), controller.recordWeight);
profileRouter.delete("/weight-entries/:id", validate(idValidation), controller.deleteWeight);

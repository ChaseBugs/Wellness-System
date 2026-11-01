import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { authenticate } from "../../../../middleware/auth.js";
import { validate } from "../../../../middleware/validate.js";
import { AppController } from "../controllers/app-controller.js";
import { UserController } from "../controllers/user-controller.js";
import { AppInstallRepository } from "../repositories/app-install-repository.js";
import { RefreshTokenRepository } from "../repositories/refresh-token-repository.js";
import { UserRepository } from "../repositories/user-repository.js";
import { AppService } from "../services/app-service.js";
import { UserService } from "../services/user-service.js";
import { appCodeParamValidation, updateUserValidation } from "../validators/user-validator.js";

const pool = getPool();
const appInstallRepository = new AppInstallRepository(pool);
const userController = new UserController(
  new UserService(new UserRepository(pool), appInstallRepository, new RefreshTokenRepository(pool))
);
const appController = new AppController(new AppService(appInstallRepository));

export const userRouter = Router();

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [Identity]
 *     summary: Current account profile
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Profile } }
 *   patch:
 *     tags: [Identity]
 *     summary: Update profile, locale and cross-app preferences
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName: { type: string }
 *               locale: { type: string }
 *               country: { type: string }
 *               timezone: { type: string }
 *               marketingOptIn: { type: boolean }
 *               crossAppRecommendations: { type: boolean, description: Opt out of cross-app recommendations }
 *     responses: { 200: { description: Updated profile } }
 *   delete:
 *     tags: [Identity]
 *     summary: Delete the account and its data in every app
 *     security: [{ bearerAuth: [] }]
 *     responses: { 204: { description: Deleted } }
 * /users/me/apps:
 *   get:
 *     tags: [Identity]
 *     summary: Apps this account has used
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Installed apps } }
 * /users/me/apps/{appCode}/open:
 *   post:
 *     tags: [Identity]
 *     summary: Record that the user opened an app (call on launch)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: appCode, in: path, required: true, schema: { type: string } }]
 *     responses: { 200: { description: Install recorded } }
 */
userRouter.get("/me", authenticate, userController.getMe);
userRouter.patch("/me", authenticate, validate(updateUserValidation), userController.updateMe);
userRouter.delete("/me", authenticate, userController.deleteMe);
userRouter.get("/me/apps", authenticate, userController.listApps);
userRouter.post("/me/apps/:appCode/open", authenticate, validate(appCodeParamValidation), appController.recordOpen);

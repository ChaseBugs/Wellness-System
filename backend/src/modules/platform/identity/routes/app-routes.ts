import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { optionalAuthenticate } from "../../../../middleware/auth.js";
import { AppController } from "../controllers/app-controller.js";
import { AppInstallRepository } from "../repositories/app-install-repository.js";
import { AppService } from "../services/app-service.js";

const appController = new AppController(new AppService(new AppInstallRepository(getPool())));

export const appRouter = Router();

/**
 * @openapi
 * /catalog/apps:
 *   get:
 *     tags: [Identity]
 *     summary: Every app in the Wellness portfolio (adds `installed` when signed in)
 *     responses: { 200: { description: App catalog } }
 */
appRouter.get("/apps", optionalAuthenticate, appController.listCatalog);

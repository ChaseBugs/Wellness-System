import { Router } from "express";
import { validate } from "../../../../middleware/validate.js";
import { HeightCatalogController } from "../controllers/height-catalog-controller.js";
import { createHeightCatalogService } from "../height-factory.js";
import { listArticlesValidation, listBannersValidation, listExercisesValidation, listPlansValidation } from "../validators/height-app-validator.js";

const controller = new HeightCatalogController(createHeightCatalogService());

// Public: the app shows the catalog before sign-up.
export const catalogRouter = Router();

/**
 * @openapi
 * /apps/height-increase/home:
 *   get:
 *     tags: [HeightIncrease]
 *     summary: Home screen (live banners, featured plan, latest articles)
 *     responses: { 200: { description: "{ cards: { myTraining, more }, banners, articles }" } }
 * /apps/height-increase/exercises:
 *   get:
 *     tags: [HeightIncrease]
 *     summary: Published exercises (expert reviewed through the Routine Engine)
 *     parameters:
 *       - { name: category, in: query, schema: { type: string } }
 *       - { name: level, in: query, schema: { type: string, enum: [beginner, intermediate, advanced] } }
 *     responses: { 200: { description: Exercises } }
 * /apps/height-increase/training-plans:
 *   get:
 *     tags: [HeightIncrease]
 *     summary: Published training plans (steps and sessions under /routines and /sessions)
 *     parameters:
 *       - { name: type, in: query, schema: { type: string, enum: [featured, daily, weekly, custom-template] } }
 *       - { name: level, in: query, schema: { type: string, enum: [beginner, intermediate, advanced] } }
 *     responses: { 200: { description: Plans } }
 * /apps/height-increase/articles:
 *   get:
 *     tags: [HeightIncrease]
 *     summary: Published articles
 *     parameters: [{ name: category, in: query, schema: { type: string } }]
 *     responses: { 200: { description: Articles } }
 * /apps/height-increase/banners:
 *   get:
 *     tags: [HeightIncrease]
 *     summary: Banners that are active now
 *     parameters: [{ name: placement, in: query, schema: { type: string, enum: [home-top, home-card, reports-top, modal, discover] } }]
 *     responses: { 200: { description: Banners } }
 */
catalogRouter.get("/home", controller.home);
catalogRouter.get("/exercises", validate(listExercisesValidation), controller.exercises);
catalogRouter.get("/training-plans", validate(listPlansValidation), controller.trainingPlans);
catalogRouter.get("/articles", validate(listArticlesValidation), controller.articles);
catalogRouter.get("/banners", validate(listBannersValidation), controller.banners);

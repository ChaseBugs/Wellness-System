import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { validate } from "../../../../middleware/validate.js";
import { createEntitlementChecker } from "../../../platform/subscription/entitlement-factory.js";
import { createChildService, createLibraryCatalog } from "../babygrow-factory.js";
import { LibraryController } from "../controllers/library-controller.js";
import { ActivityRepository } from "../repositories/activity-repository.js";
import { BookmarkRepository } from "../repositories/bookmark-repository.js";
import { ActivityLibraryService } from "../services/activity-library-service.js";
import { ReadingLibraryService } from "../services/reading-library-service.js";
import {
  ageGroupValidation,
  childIdValidation,
  completeActivityValidation,
  completeSlotValidation,
  dailyPlanValidation,
  difficultyValidation,
  idValidation,
  listActivitiesValidation,
  listArticlesValidation,
  listRecipesValidation,
  listStoriesValidation,
  searchArticlesValidation,
  updatesForAgeValidation
} from "../validators/babygrow-validator.js";

const pool = getPool();
const catalog = createLibraryCatalog();
const childService = createChildService();
const entitlements = createEntitlementChecker();
const controller = new LibraryController(
  new ActivityLibraryService(catalog, new ActivityRepository(pool), childService, entitlements),
  new ReadingLibraryService(catalog, new BookmarkRepository(pool), childService, entitlements)
);

/** Catalog endpoints: published BabyGrow content from the Content Factory. Premium items stay locked without the entitlement. */
export const libraryRouter = Router();
/** Per-child progress, mounted at /children/:childId. */
export const childLibraryRouter = Router({ mergeParams: true });

/**
 * @openapi
 * /apps/babygrow/activities:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Activities for an age (month) with optional category, sub-category and search
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: month, in: query, schema: { type: integer } }
 *       - { name: category, in: query, schema: { type: string, enum: [physical, cognitive, communication, social] } }
 *       - { name: subCategory, in: query, schema: { type: string } }
 *       - { name: search, in: query, schema: { type: string } }
 *     responses: { 200: { description: Activities } }
 * /apps/babygrow/activities/sub-categories:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Distinct activity sub-categories
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Sub-categories } }
 * /apps/babygrow/activities/{id}:
 *   get:
 *     tags: [BabyGrow]
 *     summary: One activity
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Activity } }
 * /apps/babygrow/daily-updates:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Tips, development notes and safety reminders for an age
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: ageInMonths, in: query, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Daily updates } }
 * /apps/babygrow/recipes:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Baby and mum recipes
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: category, in: query, schema: { type: string } }
 *       - { name: target, in: query, schema: { type: string, enum: [baby, mum] } }
 *     responses: { 200: { description: Recipes } }
 * /apps/babygrow/recipes/favorites:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Saved recipes
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Recipes } }
 * /apps/babygrow/recipes/age-group/{group}:
 *   get:
 *     tags: [BabyGrow]
 *     summary: "Recipes for an age group (0-6, 7-11, 12-17, 18-24, 25-30, 31-36)"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: group, in: path, required: true, schema: { type: string } }
 *       - { name: mealSlot, in: query, schema: { type: string } }
 *     responses: { 200: { description: Recipes } }
 * /apps/babygrow/recipes/{id}:
 *   get:
 *     tags: [BabyGrow]
 *     summary: One recipe
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Recipe } }
 * /apps/babygrow/recipes/{id}/favorite:
 *   put:
 *     tags: [BabyGrow]
 *     summary: Save a recipe
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Saved } }
 *   delete:
 *     tags: [BabyGrow]
 *     summary: Unsave a recipe
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Removed } }
 * /apps/babygrow/articles:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Parenting articles with optional category, age and text filters
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: category, in: query, schema: { type: string } }
 *       - { name: month, in: query, schema: { type: integer } }
 *       - { name: q, in: query, schema: { type: string } }
 *     responses: { 200: { description: Articles } }
 * /apps/babygrow/articles/search:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Search articles
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: q, in: query, required: true, schema: { type: string } }]
 *     responses: { 200: { description: Articles } }
 * /apps/babygrow/articles/bookmarked:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Bookmarked articles
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Articles } }
 * /apps/babygrow/articles/{id}:
 *   get:
 *     tags: [BabyGrow]
 *     summary: One article
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Article } }
 * /apps/babygrow/articles/{id}/bookmark:
 *   put:
 *     tags: [BabyGrow]
 *     summary: Bookmark an article
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Saved } }
 *   delete:
 *     tags: [BabyGrow]
 *     summary: Remove the bookmark
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Removed } }
 * /apps/babygrow/stories:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Bedtime stories for an age with optional search
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: ageMonths, in: query, schema: { type: integer } }
 *       - { name: search, in: query, schema: { type: string } }
 *     responses: { 200: { description: Stories } }
 * /apps/babygrow/stories/bookmarked:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Bookmarked stories
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Stories } }
 * /apps/babygrow/stories/{id}:
 *   get:
 *     tags: [BabyGrow]
 *     summary: One story
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Story } }
 * /apps/babygrow/stories/{id}/bookmark:
 *   put:
 *     tags: [BabyGrow]
 *     summary: Bookmark a story
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Saved } }
 *   delete:
 *     tags: [BabyGrow]
 *     summary: Remove the bookmark
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: "#/components/parameters/Id" }]
 *     responses: { 200: { description: Removed } }
 */
libraryRouter.get("/activities", validate(listActivitiesValidation), controller.activities);
libraryRouter.get("/activities/sub-categories", controller.subCategories);
libraryRouter.get("/activities/:id", validate(idValidation), controller.activity);
libraryRouter.get("/daily-updates", validate(updatesForAgeValidation), controller.updatesForAge);

libraryRouter.get("/recipes", validate(listRecipesValidation), controller.recipes);
libraryRouter.get("/recipes/favorites", controller.favoriteRecipes);
libraryRouter.get("/recipes/age-group/:group", validate(ageGroupValidation), controller.recipesByAgeGroup);
libraryRouter.get("/recipes/:id", validate(idValidation), controller.recipe);
libraryRouter.put("/recipes/:id/favorite", validate(idValidation), controller.bookmark("recipe", true));
libraryRouter.delete("/recipes/:id/favorite", validate(idValidation), controller.bookmark("recipe", false));

libraryRouter.get("/articles", validate(listArticlesValidation), controller.articles);
libraryRouter.get("/articles/search", validate(searchArticlesValidation), controller.articles);
libraryRouter.get("/articles/bookmarked", controller.bookmarkedArticles);
libraryRouter.get("/articles/:id", validate(idValidation), controller.article);
libraryRouter.put("/articles/:id/bookmark", validate(idValidation), controller.bookmark("article", true));
libraryRouter.delete("/articles/:id/bookmark", validate(idValidation), controller.bookmark("article", false));

libraryRouter.get("/stories", validate(listStoriesValidation), controller.stories);
libraryRouter.get("/stories/bookmarked", controller.bookmarkedStories);
libraryRouter.get("/stories/:id", validate(idValidation), controller.story);
libraryRouter.put("/stories/:id/bookmark", validate(idValidation), controller.bookmark("story", true));
libraryRouter.delete("/stories/:id/bookmark", validate(idValidation), controller.bookmark("story", false));

/**
 * @openapi
 * /apps/babygrow/children/{childId}/activities:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Activities this child has done, newest first
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: childId, in: path, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: History } }
 * /apps/babygrow/children/{childId}/activities/{activityId}/complete:
 *   post:
 *     tags: [BabyGrow]
 *     summary: Record that the child did an activity
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: childId, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { name: activityId, in: path, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               difficultyFeedback: { type: string, enum: [too_easy, just_right, too_hard] }
 *               notes: { type: string }
 *     responses: { 201: { description: Logged } }
 * /apps/babygrow/children/{childId}/activities/{activityId}/difficulty:
 *   post:
 *     tags: [BabyGrow]
 *     summary: Rate how hard the activity was for the child
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: childId, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { name: activityId, in: path, required: true, schema: { type: string, format: uuid } }
 *     responses: { 200: { description: Saved } }
 * /apps/babygrow/children/{childId}/daily-activities:
 *   get:
 *     tags: [BabyGrow]
 *     summary: "Four activities for the day (physical, cognitive, communication, social), stable per date"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: childId, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { name: date, in: query, schema: { type: string, format: date } }
 *     responses: { 200: { description: Daily plan } }
 * /apps/babygrow/children/{childId}/daily-activities/{slot}/complete:
 *   post:
 *     tags: [BabyGrow]
 *     summary: Mark a daily slot done
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: childId, in: path, required: true, schema: { type: string, format: uuid } }
 *       - { name: slot, in: path, required: true, schema: { type: integer, minimum: 1, maximum: 4 } }
 *       - { name: date, in: query, schema: { type: string, format: date } }
 *     responses: { 200: { description: Slot } }
 * /apps/babygrow/children/{childId}/daily-updates/today:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Daily updates for the child's current age
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: childId, in: path, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Daily updates } }
 * /apps/babygrow/children/{childId}/recipes:
 *   get:
 *     tags: [BabyGrow]
 *     summary: Baby recipes for the child's age group
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: childId, in: path, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Recipes } }
 */
childLibraryRouter.get("/activities", validate(childIdValidation), controller.activityHistory);
childLibraryRouter.post("/activities/:activityId/complete", validate(completeActivityValidation), controller.completeActivity);
childLibraryRouter.post("/activities/:activityId/difficulty", validate(difficultyValidation), controller.setDifficulty);
childLibraryRouter.get("/daily-activities", validate(dailyPlanValidation), controller.dailyPlan);
childLibraryRouter.post("/daily-activities/:slot/complete", validate(completeSlotValidation), controller.completeDailySlot);
childLibraryRouter.get("/daily-updates/today", validate(childIdValidation), controller.todaysUpdates);
childLibraryRouter.get("/recipes", validate(childIdValidation), controller.childRecipes);

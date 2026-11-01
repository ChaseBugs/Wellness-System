import { Router } from "express";
import { getPool } from "../../../../config/database.js";
import { validate } from "../../../../middleware/validate.js";
import { NutritionToolsController } from "../controllers/nutrition-tools-controller.js";
import { createDailyTargetService } from "../foodvisor-factory.js";
import { FoodRepository } from "../repositories/food-repository.js";
import { MealLogRepository } from "../repositories/meal-log-repository.js";
import { NutritionReferenceRepository } from "../repositories/nutrition-reference-repository.js";
import { DietOptimizerService } from "../services/diet-optimizer-service.js";
import { HealthMetricsService } from "../services/health-metrics-service.js";
import { IntakeAnalysisService } from "../services/intake-analysis-service.js";
import {
  analyzeIntakeValidation,
  dailyTargetsBodyValidation,
  dailyTargetsQueryValidation,
  healthMetricsValidation,
  optimizeDietValidation
} from "../validators/foodvisor-validator.js";

const pool = getPool();
const dailyTargetService = createDailyTargetService();
const controller = new NutritionToolsController(
  new HealthMetricsService(),
  dailyTargetService,
  new DietOptimizerService(new FoodRepository(pool), new NutritionReferenceRepository(pool), dailyTargetService),
  new IntakeAnalysisService(new MealLogRepository(pool), dailyTargetService)
);

/** Stateless calculators: no account needed (the Foodvisor app calls them before sign-up). */
export const nutritionToolsPublicRouter = Router();
/** Calculators that read or are costly for the signed-in user's data. */
export const nutritionToolsRouter = Router();

/**
 * @openapi
 * /apps/foodvisor/health-metrics/calculate:
 *   post:
 *     tags: [Foodvisor]
 *     summary: BMI, BMR (4 formulas), TDEE, calorie and macro goals, child growth screening (no auth)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [gender, age, heightCm, weightKg]
 *             properties:
 *               gender: { type: string, enum: [male, female, non_binary] }
 *               age: { type: number }
 *               heightCm: { type: number }
 *               weightKg: { type: number }
 *               activityLevel: { type: string, enum: [sedentary, low_active, active, very_active] }
 *               goal: { type: string, enum: [lose_weight, maintain_weight, gain_weight] }
 *               macroRatios: { type: object, properties: { carbs: { type: number }, fat: { type: number }, protein: { type: number } } }
 *               activities: { type: array, items: { type: object, properties: { name: { type: string }, metValue: { type: number }, durationMinutes: { type: number } } } }
 *     responses: { 200: { description: Metrics } }
 * /apps/foodvisor/daily-targets:
 *   get:
 *     tags: [Foodvisor]
 *     summary: WS/T 578 per-nutrient daily targets for a profile (no auth)
 *     parameters:
 *       - { name: age, in: query, required: true, schema: { type: number } }
 *       - { name: gender, in: query, schema: { type: string, enum: [male, female, all] } }
 *       - { name: lifeStage, in: query, schema: { type: string, example: pregnancy_mid } }
 *       - { name: physicalActivityLevel, in: query, schema: { type: string, enum: [light, moderate, heavy] } }
 *     responses: { 200: { description: Targets } }
 * /apps/foodvisor/daily-targets/resolve:
 *   post:
 *     tags: [Foodvisor]
 *     summary: Same as GET with a JSON body (used by the Foodvisor app; no auth)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [age], properties: { age: { type: number }, gender: { type: string }, lifeStage: { type: string }, populationGroup: { type: string }, physicalActivityLevel: { type: string } } }
 *     responses: { 200: { description: Targets } }
 * /apps/foodvisor/daily-targets/me:
 *   get:
 *     tags: [Foodvisor]
 *     summary: Targets for the signed-in user's Foodvisor profile
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Targets }, 400: { description: Profile has no age } }
 * /apps/foodvisor/diet-optimizer/optimize:
 *   post:
 *     tags: [Foodvisor]
 *     summary: Linear-programming diet that meets nutrient bounds at minimum calories
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetProfile: { type: object, description: Derive bounds from daily targets, properties: { age: { type: number }, gender: { type: string } } }
 *               profileKey: { type: string, description: nutrition_constraints profile }
 *               constraints: { type: array, items: { type: object } }
 *               includeCategories: { type: array, items: { type: string } }
 *               excludeTerms: { type: array, items: { type: string } }
 *               maxServingsPerFood: { type: number }
 *     responses: { 200: { description: Solution (feasible or not) } }
 * /apps/foodvisor/daily-intake/analyze:
 *   get:
 *     tags: [Foodvisor]
 *     summary: Logged intake vs daily targets per nutrient (defaults to today, UTC)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: from, in: query, schema: { type: string, format: date-time } }
 *       - { name: to, in: query, schema: { type: string, format: date-time } }
 *       - { name: age, in: query, schema: { type: number }, description: Override the profile's age }
 *       - { name: gender, in: query, schema: { type: string } }
 *     responses: { 200: { description: Intake report } }
 */
nutritionToolsPublicRouter.post("/health-metrics/calculate", validate(healthMetricsValidation), controller.healthMetrics);
nutritionToolsPublicRouter.get("/daily-targets", validate(dailyTargetsQueryValidation), controller.dailyTargetsFromQuery);
nutritionToolsPublicRouter.post("/daily-targets/resolve", validate(dailyTargetsBodyValidation), controller.dailyTargetsFromBody);

nutritionToolsRouter.get("/daily-targets/me", controller.myDailyTargets);
nutritionToolsRouter.post("/diet-optimizer/optimize", validate(optimizeDietValidation), controller.optimizeDiet);
nutritionToolsRouter.get("/daily-intake/analyze", validate(analyzeIntakeValidation), controller.analyzeIntake);

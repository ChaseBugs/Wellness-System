import { Router } from 'express';
import { DailyPlanController } from '../controllers/dailyPlan.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const dailyPlanController = new DailyPlanController();

/**
 * @swagger
 * /api/v1/daily-plan/baby/:babyId:
 *   get:
 *     summary: Get daily plan for a baby
 *     tags: [Daily Plan]
 *     security:
 *       - bearerAuth: []
 */
router.get('/baby/:babyId', authenticate, dailyPlanController.getDailyPlan.bind(dailyPlanController));

/**
 * @swagger
 * /api/v1/daily-plan/generate:
 *   post:
 *     summary: Generate a new daily plan
 *     tags: [Daily Plan]
 *     security:
 *       - bearerAuth: []
 */
router.post('/generate', authenticate, dailyPlanController.generateDailyPlan.bind(dailyPlanController));

/**
 * @swagger
 * /api/v1/daily-plan/:id:
 *   put:
 *     summary: Update daily plan
 *     tags: [Daily Plan]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, dailyPlanController.updateDailyPlan.bind(dailyPlanController));

/**
 * @swagger
 * /api/v1/daily-plan/baby/:babyId/history:
 *   get:
 *     summary: Get daily plans history
 *     tags: [Daily Plan]
 *     security:
 *       - bearerAuth: []
 */
router.get('/baby/:babyId/history', authenticate, dailyPlanController.getDailyPlans.bind(dailyPlanController));

export default router;

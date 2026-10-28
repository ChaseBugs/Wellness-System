import { Router } from 'express';
import { body } from 'express-validator';
import { GrowthController } from '../controllers/growth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();
const growthController = new GrowthController();

/**
 * @swagger
 * /api/v1/growth/baby/:babyId:
 *   get:
 *     summary: Get growth records for a baby
 *     tags: [Growth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/baby/:babyId', authenticate, growthController.getGrowthRecords.bind(growthController));

/**
 * @swagger
 * /api/v1/growth:
 *   post:
 *     summary: Create a new growth record
 *     tags: [Growth]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  authenticate,
  [
    body('baby_id').isInt(),
    body('record_date').isISO8601().toDate(),
    body('weight_kg').optional().isFloat({ min: 0 }),
    body('height_cm').optional().isFloat({ min: 0 }),
    body('head_circumference_cm').optional().isFloat({ min: 0 }),
  ],
  validateRequest,
  growthController.createGrowthRecord.bind(growthController)
);

/**
 * @swagger
 * /api/v1/growth/:id:
 *   put:
 *     summary: Update growth record
 *     tags: [Growth]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, growthController.updateGrowthRecord.bind(growthController));

/**
 * @swagger
 * /api/v1/growth/:id:
 *   delete:
 *     summary: Delete growth record
 *     tags: [Growth]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, growthController.deleteGrowthRecord.bind(growthController));

/**
 * @swagger
 * /api/v1/growth/baby/:babyId/chart:
 *   get:
 *     summary: Get growth chart data with WHO percentiles
 *     tags: [Growth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/baby/:babyId/chart', authenticate, growthController.getGrowthChart.bind(growthController));
router.get('/baby/:babyId/chart/:metric/enhanced', authenticate, growthController.getEnhancedGrowthChart.bind(growthController));

export default router;

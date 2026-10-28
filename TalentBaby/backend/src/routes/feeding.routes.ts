import { Router } from 'express';
import { body } from 'express-validator';
import { FeedingController } from '../controllers/feeding.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();
const feedingController = new FeedingController();

/**
 * @swagger
 * /api/v1/feeding/baby/:babyId:
 *   get:
 *     summary: Get feeding records for a baby
 *     tags: [Feeding]
 *     security:
 *       - bearerAuth: []
 */
router.get('/baby/:babyId', authenticate, feedingController.getFeedings.bind(feedingController));

/**
 * @swagger
 * /api/v1/feeding:
 *   post:
 *     summary: Create a new feeding record
 *     tags: [Feeding]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  authenticate,
  [
    body('baby_id').isInt(),
    body('feeding_type').isIn(['breastfeeding', 'formula', 'solid', 'mixed']),
    body('feeding_date').isISO8601().toDate(),
  ],
  validateRequest,
  feedingController.createFeeding.bind(feedingController)
);

/**
 * @swagger
 * /api/v1/feeding/:id:
 *   put:
 *     summary: Update feeding record
 *     tags: [Feeding]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, feedingController.updateFeeding.bind(feedingController));

/**
 * @swagger
 * /api/v1/feeding/:id:
 *   delete:
 *     summary: Delete feeding record
 *     tags: [Feeding]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, feedingController.deleteFeeding.bind(feedingController));

/**
 * @swagger
 * /api/v1/feeding/baby/:babyId/statistics:
 *   get:
 *     summary: Get feeding statistics
 *     tags: [Feeding]
 *     security:
 *       - bearerAuth: []
 */
router.get('/baby/:babyId/statistics', authenticate, feedingController.getStatistics.bind(feedingController));
router.get('/baby/:babyId/patterns', authenticate, feedingController.getFeedingPatterns.bind(feedingController));
router.get('/baby/:babyId/recommendations', authenticate, feedingController.getFeedingRecommendations.bind(feedingController));

export default router;

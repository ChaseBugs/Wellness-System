import { Router } from 'express';
import { GuideController } from '../controllers/guide.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const guideController = new GuideController();

/**
 * @swagger
 * /api/v1/guides/sleep:
 *   get:
 *     summary: Get sleep guide content
 *     tags: [Guides]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: age_months
 *         schema:
 *           type: integer
 *         description: Baby age in months
 *       - in: query
 *         name: baby_id
 *         schema:
 *           type: integer
 *         description: Baby ID (alternative to age_months)
 */
router.get('/sleep', authenticate, guideController.getSleepGuide.bind(guideController));

/**
 * @swagger
 * /api/v1/guides/sleep/tips:
 *   get:
 *     summary: Get sleep tips by age
 *     tags: [Guides]
 *     security:
 *       - bearerAuth: []
 */
router.get('/sleep/tips', authenticate, guideController.getSleepTips.bind(guideController));

/**
 * @swagger
 * /api/v1/guides/sleep/schedule:
 *   get:
 *     summary: Get sleep schedule recommendations
 *     tags: [Guides]
 *     security:
 *       - bearerAuth: []
 */
router.get('/sleep/schedule', authenticate, guideController.getSleepSchedule.bind(guideController));

/**
 * @swagger
 * /api/v1/guides/feeding:
 *   get:
 *     summary: Get feeding guide content
 *     tags: [Guides]
 *     security:
 *       - bearerAuth: []
 */
router.get('/feeding', authenticate, guideController.getFeedingGuide.bind(guideController));

/**
 * @swagger
 * /api/v1/guides/feeding/tips:
 *   get:
 *     summary: Get feeding tips by age
 *     tags: [Guides]
 *     security:
 *       - bearerAuth: []
 */
router.get('/feeding/tips', authenticate, guideController.getFeedingTips.bind(guideController));

/**
 * @swagger
 * /api/v1/guides/feeding/age-guide:
 *   get:
 *     summary: Get age-by-age feeding guide
 *     tags: [Guides]
 *     security:
 *       - bearerAuth: []
 */
router.get('/feeding/age-guide', authenticate, guideController.getFeedingAgeGuide.bind(guideController));

/**
 * @swagger
 * /api/v1/guides/feeding/adequacy:
 *   get:
 *     summary: Check if baby is getting enough (nutritional analysis)
 *     tags: [Guides]
 *     security:
 *       - bearerAuth: []
 */
router.get('/feeding/adequacy', authenticate, guideController.getFeedingAdequacy.bind(guideController));

export default router;

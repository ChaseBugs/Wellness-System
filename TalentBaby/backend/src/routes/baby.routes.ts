import { Router } from 'express';
import { body } from 'express-validator';
import { BabyController } from '../controllers/baby.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();
const babyController = new BabyController();

/**
 * @swagger
 * /api/v1/babies:
 *   get:
 *     summary: Get all babies for authenticated user
 *     tags: [Babies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of babies
 */
router.get('/', authenticate, babyController.getBabies.bind(babyController));

/**
 * @swagger
 * /api/v1/babies/active:
 *   get:
 *     summary: Get the currently active baby for the authenticated user
 *     tags: [Babies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active baby
 *       404:
 *         description: No active baby found
 */
router.get('/active', authenticate, babyController.getActiveBaby.bind(babyController));

/**
 * @swagger
 * /api/v1/babies/admin/all:
 *   get:
 *     summary: Get all babies across all users (admin)
 *     tags: [Babies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All babies
 */
router.get('/admin/all', authenticate, babyController.getAllBabies.bind(babyController));

/**
 * @swagger
 * /api/v1/babies:
 *   post:
 *     summary: Create a new baby profile
 *     tags: [Babies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Baby profile created
 */
router.post(
  '/',
  authenticate,
  [
    body('name').trim().notEmpty(),
    body('birth_date').isISO8601().toDate(),
    body('gender').optional().isIn(['male', 'female', 'other']),
  ],
  validateRequest,
  babyController.createBaby.bind(babyController)
);

/**
 * @swagger
 * /api/v1/babies/:id:
 *   get:
 *     summary: Get baby by ID
 *     tags: [Babies]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, babyController.getBabyById.bind(babyController));

/**
 * @swagger
 * /api/v1/babies/:id:
 *   put:
 *     summary: Update baby profile
 *     tags: [Babies]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, babyController.updateBaby.bind(babyController));

/**
 * @swagger
 * /api/v1/babies/:id:
 *   delete:
 *     summary: Delete baby profile
 *     tags: [Babies]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, babyController.deleteBaby.bind(babyController));

export default router;

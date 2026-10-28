import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * /api/v1/users/all:
 *   get:
 *     summary: Get all users with their babies (admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All users retrieved
 */
router.get('/all', authenticate, userController.getAllUsers.bind(userController));
router.post('/admin/create', authenticate, userController.createUserAdmin.bind(userController));

/**
 * @swagger
 * /api/v1/users/active-baby:
 *   put:
 *     summary: Set active (main) baby for the logged-in user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               baby_id:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Active baby updated
 */
router.put('/active-baby', authenticate, userController.setActiveBaby.bind(userController));

/**
 * @swagger
 * /api/v1/users/{id}/active-baby:
 *   put:
 *     summary: Set active baby for any user (admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               baby_id:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Active baby updated
 */
router.put('/:id/active-baby', authenticate, userController.setActiveBabyAdmin.bind(userController));

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 */
router.get('/profile', authenticate, userController.getProfile.bind(userController));

/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', authenticate, userController.updateProfile.bind(userController));

/**
 * @swagger
 * /api/v1/users/notifications/preferences:
 *   get:
 *     summary: Get notification preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification preferences retrieved
 */
router.get(
  '/notifications/preferences',
  authenticate,
  userController.getNotificationPreferences.bind(userController)
);

/**
 * @swagger
 * /api/v1/users/notifications/preferences:
 *   put:
 *     summary: Update notification preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 */
router.put(
  '/notifications/preferences',
  authenticate,
  userController.updateNotificationPreferences.bind(userController)
);

export default router;

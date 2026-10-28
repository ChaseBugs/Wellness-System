import { Router } from 'express';
import { UserActionLogController } from '../controllers/userActionLog.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const userActionLogController = new UserActionLogController();

/**
 * @swagger
 * /api/v1/user-action-logs:
 *   get:
 *     summary: Get user's action logs
 *     tags: [User Action Logs]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, userActionLogController.getUserActionLogs.bind(userActionLogController));

/**
 * @swagger
 * /api/v1/user-action-logs/type/:actionType:
 *   get:
 *     summary: Get logs by action type
 *     tags: [User Action Logs]
 *     security:
 *       - bearerAuth: []
 */
router.get('/type/:actionType', authenticate, userActionLogController.getActionLogsByType.bind(userActionLogController));

/**
 * @swagger
 * /api/v1/user-action-logs/resource/:resourceType/:resourceId:
 *   get:
 *     summary: Get logs for a specific resource
 *     tags: [User Action Logs]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/resource/:resourceType/:resourceId',
  authenticate,
  userActionLogController.getResourceLogs.bind(userActionLogController)
);

/**
 * @swagger
 * /api/v1/user-action-logs/date-range:
 *   get:
 *     summary: Get logs by date range
 *     tags: [User Action Logs]
 *     security:
 *       - bearerAuth: []
 */
router.get('/date-range', authenticate, userActionLogController.getLogsByDateRange.bind(userActionLogController));

/**
 * @swagger
 * /api/v1/user-action-logs/statistics:
 *   get:
 *     summary: Get action log statistics
 *     tags: [User Action Logs]
 *     security:
 *       - bearerAuth: []
 */
router.get('/statistics', authenticate, userActionLogController.getStatistics.bind(userActionLogController));

/**
 * @swagger
 * /api/v1/user-action-logs/cleanup:
 *   post:
 *     summary: Cleanup old logs
 *     tags: [User Action Logs]
 *     security:
 *       - bearerAuth: []
 */
router.post('/cleanup', authenticate, userActionLogController.cleanupOldLogs.bind(userActionLogController));

export default router;

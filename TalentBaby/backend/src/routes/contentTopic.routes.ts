import { Router } from 'express';
import { ContentTopicController } from '../controllers/contentTopic.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const contentTopicController = new ContentTopicController();

/**
 * @swagger
 * /api/v1/content/topics:
 *   get:
 *     summary: Get all content topics
 *     tags: [Content Topics]
 *     security:
 *       - bearerAuth: []
 */
router.get('/topics', authenticate, contentTopicController.getTopics.bind(contentTopicController));

/**
 * @swagger
 * /api/v1/content/topic/:id:
 *   get:
 *     summary: Get content by topic
 *     tags: [Content Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [article, story, activity, recipe]
 */
router.get('/topic/:id', authenticate, contentTopicController.getTopic.bind(contentTopicController));

/**
 * @swagger
 * /api/v1/content/search:
 *   get:
 *     summary: Search content across all types
 *     tags: [Content Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [article, story, activity, recipe]
 */
router.get('/search', authenticate, contentTopicController.searchContent.bind(contentTopicController));

export default router;

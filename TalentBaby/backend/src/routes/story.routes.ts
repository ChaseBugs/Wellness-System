import { Router } from 'express';
import { StoryController } from '../controllers/story.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const storyController = new StoryController();

/**
 * @swagger
 * /api/v1/stories:
 *   get:
 *     summary: Get bedtime stories
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: age_months
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 */
router.get('/', authenticate, storyController.getStories.bind(storyController));

/**
 * @swagger
 * /api/v1/stories/categories:
 *   get:
 *     summary: Get story categories
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 */
router.get('/categories', authenticate, storyController.getStoryCategories.bind(storyController));

/**
 * @swagger
 * /api/v1/stories/favorites:
 *   get:
 *     summary: Get favorite stories
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 */
router.get('/favorites', authenticate, storyController.getFavoriteStories.bind(storyController));

/**
 * @swagger
 * /api/v1/stories/:id:
 *   get:
 *     summary: Get story details
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, storyController.getStory.bind(storyController));

/**
 * @swagger
 * /api/v1/stories/:id/audio:
 *   get:
 *     summary: Get story audio URL
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/audio', authenticate, storyController.getStoryAudio.bind(storyController));

/**
 * @swagger
 * /api/v1/stories/:id/favorite:
 *   post:
 *     summary: Add story to favorites
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/favorite', authenticate, storyController.addToFavorites.bind(storyController));

/**
 * @swagger
 * /api/v1/stories/:id/favorite:
 *   delete:
 *     summary: Remove story from favorites
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id/favorite', authenticate, storyController.removeFromFavorites.bind(storyController));

/**
 * @swagger
 * /api/v1/stories/favorites:
 *   get:
 *     summary: Get favorite stories
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 */
router.get('/favorites/list', authenticate, storyController.getFavoriteStories.bind(storyController));

export default router;

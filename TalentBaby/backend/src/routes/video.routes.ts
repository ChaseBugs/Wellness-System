import { Router } from 'express';
import { VideoController } from '../controllers/video.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadVideo } from '../utils/fileUpload';

const router = Router();
const videoController = new VideoController();

/**
 * @swagger
 * /api/v1/video/upload:
 *   post:
 *     summary: Upload a video
 *     tags: [Video]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/upload',
  authenticate,
  uploadVideo.single('video'),
  videoController.uploadVideo.bind(videoController)
);

/**
 * @swagger
 * /api/v1/video/baby/{babyId}:
 *   get:
 *     summary: Get videos for a baby
 *     tags: [Video]
 *     security:
 *       - bearerAuth: []
 */
router.get('/baby/:babyId', authenticate, videoController.getBabyVideos.bind(videoController));

/**
 * @swagger
 * /api/v1/video/link/milestone:
 *   post:
 *     summary: Link video to milestone
 *     tags: [Video]
 *     security:
 *       - bearerAuth: []
 */
router.post('/link/milestone', authenticate, videoController.linkVideoToMilestone.bind(videoController));

/**
 * @swagger
 * /api/v1/video/link/activity:
 *   post:
 *     summary: Link video to activity
 *     tags: [Video]
 *     security:
 *       - bearerAuth: []
 */
router.post('/link/activity', authenticate, videoController.linkVideoToActivity.bind(videoController));

/**
 * @swagger
 * /api/v1/video/milestone/:milestoneId:
 *   get:
 *     summary: Get videos for a milestone
 *     tags: [Video]
 *     security:
 *       - bearerAuth: []
 */
router.get('/milestone/:milestoneId', authenticate, videoController.getMilestoneVideos.bind(videoController));

/**
 * @swagger
 * /api/v1/video/activity/:babyActivityId:
 *   get:
 *     summary: Get videos for an activity
 *     tags: [Video]
 *     security:
 *       - bearerAuth: []
 */
router.get('/activity/:babyActivityId', authenticate, videoController.getActivityVideos.bind(videoController));
router.get('/timeline/baby/:babyId', authenticate, videoController.getVideoTimeline.bind(videoController));
router.get('/metadata/:memoryId', authenticate, videoController.getVideoMetadata.bind(videoController));

/**
 * @swagger
 * /api/v1/video/{id}:
 *   get:
 *     summary: Get video details
 *     tags: [Video]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Delete video
 *     tags: [Video]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, videoController.getVideo.bind(videoController));
router.delete('/:id', authenticate, videoController.deleteVideo.bind(videoController));

export default router;

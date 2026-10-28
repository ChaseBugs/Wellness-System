import { Router } from 'express';
import { VideoTagController } from '../controllers/videoTag.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const videoTagController = new VideoTagController();

router.post('/memory/:memoryId', authenticate, videoTagController.addTag.bind(videoTagController));
router.delete('/memory/:memoryId/tag/:tagName', authenticate, videoTagController.removeTag.bind(videoTagController));
router.get('/memory/:memoryId', authenticate, videoTagController.getTagsByMemory.bind(videoTagController));
router.get('/tag/:tagName/memories', authenticate, videoTagController.getMemoriesByTag.bind(videoTagController));
router.get('/', authenticate, videoTagController.getAllTags.bind(videoTagController));

export default router;

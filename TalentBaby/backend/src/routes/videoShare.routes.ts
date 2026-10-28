import { Router } from 'express';
import { VideoShareController } from '../controllers/videoShare.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const videoShareController = new VideoShareController();

router.post('/', authenticate, videoShareController.createShare.bind(videoShareController));
router.get('/token/:token', videoShareController.getShareByToken.bind(videoShareController)); // Public endpoint
router.get('/memory/:memoryId', authenticate, videoShareController.getSharesByMemory.bind(videoShareController));
router.delete('/:id', authenticate, videoShareController.deleteShare.bind(videoShareController));

export default router;

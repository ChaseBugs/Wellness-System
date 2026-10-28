import { Router } from 'express';
import { ContentSyncController } from '../controllers/contentSync.controller';

const router = Router();
const controller = new ContentSyncController();

router.get('/manifest', controller.getManifest.bind(controller));
router.get('/delta', controller.getDelta.bind(controller));

export default router;

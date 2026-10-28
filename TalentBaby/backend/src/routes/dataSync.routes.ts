import { Router } from 'express';
import { DataSyncController } from '../controllers/dataSync.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const dataSyncController = new DataSyncController();

router.get('/sync', authenticate, dataSyncController.getSyncData.bind(dataSyncController));

export default router;

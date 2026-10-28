import { Router } from 'express';
import { DailyUpdateController } from '../controllers/dailyUpdate.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const dailyUpdateController = new DailyUpdateController();

router.get('/baby/:babyId/today', authenticate, dailyUpdateController.getTodayUpdate.bind(dailyUpdateController));
router.get('/baby/:babyId', authenticate, dailyUpdateController.getDailyUpdates.bind(dailyUpdateController));
router.get('/age/:ageInMonths', authenticate, dailyUpdateController.getAllUpdates.bind(dailyUpdateController));

export default router;

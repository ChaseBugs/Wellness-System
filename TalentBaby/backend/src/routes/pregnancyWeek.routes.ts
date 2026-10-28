import { Router } from 'express';
import { PregnancyWeekController } from '../controllers/pregnancyWeek.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const pregnancyWeekController = new PregnancyWeekController();

router.get('/week/:weekNumber', authenticate, pregnancyWeekController.getWeekContent.bind(pregnancyWeekController));
router.get('/weeks', authenticate, pregnancyWeekController.getAllWeeks.bind(pregnancyWeekController));
router.get('/weeks/range', authenticate, pregnancyWeekController.getWeekRange.bind(pregnancyWeekController));

export default router;

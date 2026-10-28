import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const reportController = new ReportController();

router.get('/baby/:babyId/growth', authenticate, reportController.generateGrowthReport.bind(reportController));
router.get('/baby/:babyId/feeding', authenticate, reportController.generateFeedingReport.bind(reportController));
router.get('/baby/:babyId/sleep', authenticate, reportController.generateSleepReport.bind(reportController));
router.get('/baby/:babyId/development', authenticate, reportController.generateDevelopmentReport.bind(reportController));

export default router;

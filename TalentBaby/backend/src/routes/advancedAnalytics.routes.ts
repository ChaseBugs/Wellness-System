import { Router } from 'express';
import { AdvancedAnalyticsController } from '../controllers/advancedAnalytics.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePremium } from '../middleware/premium.middleware';

const router = Router();
const analyticsController = new AdvancedAnalyticsController();

router.get(
  '/baby/:babyId/comprehensive',
  authenticate,
  requirePremium,
  analyticsController.getComprehensiveAnalytics.bind(analyticsController)
);

export default router;

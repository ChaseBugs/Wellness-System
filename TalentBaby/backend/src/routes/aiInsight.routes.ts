import { Router } from 'express';
import { AIInsightController } from '../controllers/aiInsight.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePremium } from '../middleware/premium.middleware';

const router = Router();
const aiInsightController = new AIInsightController();

router.post('/generate', authenticate, requirePremium, aiInsightController.generateInsight.bind(aiInsightController));
router.get('/baby/:babyId', authenticate, aiInsightController.getInsights.bind(aiInsightController));

export default router;

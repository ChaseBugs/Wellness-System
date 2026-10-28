import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AIInsightService } from '../services/aiInsight.service';
import { logger } from '../utils/logger';

export class AIInsightController {
  private aiInsightService: AIInsightService;

  constructor() {
    this.aiInsightService = new AIInsightService();
  }

  async generateInsight(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.body.baby_id, 10);
      const insightType = req.body.insight_type || 'recommendation';

      const insight = await this.aiInsightService.generateInsight(babyId, userId, insightType);

      logger.info('AI insight generated', { userId, babyId, insightId: insight.id });

      res.status(201).json({
        message: 'AI insight generated successfully',
        data: insight,
      });
    } catch (error) {
      next(error);
    }
  }

  async getInsights(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);
      const insightType = req.query.type as string | undefined;

      const insights = await this.aiInsightService.getInsights(babyId, userId, insightType);

      res.status(200).json({
        message: 'AI insights retrieved successfully',
        data: insights,
      });
    } catch (error) {
      next(error);
    }
  }
}

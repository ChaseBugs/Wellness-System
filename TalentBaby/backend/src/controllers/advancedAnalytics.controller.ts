import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AdvancedAnalyticsService } from '../services/advancedAnalytics.service';

export class AdvancedAnalyticsController {
  private analyticsService: AdvancedAnalyticsService;

  constructor() {
    this.analyticsService = new AdvancedAnalyticsService();
  }

  async getComprehensiveAnalytics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      const analytics = await this.analyticsService.getComprehensiveAnalytics(
        babyId,
        userId,
        startDate,
        endDate
      );

      res.status(200).json({
        message: 'Comprehensive analytics retrieved successfully',
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }
}

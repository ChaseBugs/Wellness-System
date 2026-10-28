import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { DailyPlanService } from '../services/dailyPlan.service';
import { logger } from '../utils/logger';

export class DailyPlanController {
  private dailyPlanService: DailyPlanService;

  constructor() {
    this.dailyPlanService = new DailyPlanService();
  }

  async getDailyPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);
      const date = req.query.date ? new Date(req.query.date as string) : new Date();

      const plan = await this.dailyPlanService.getDailyPlan(babyId, userId, date);

      res.status(200).json({
        message: 'Daily plan retrieved successfully',
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }

  async generateDailyPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.body.baby_id, 10);
      const date = req.body.date ? new Date(req.body.date) : new Date();

      const plan = await this.dailyPlanService.generateDailyPlan(babyId, date);

      logger.info('Daily plan generated', { userId, babyId, planId: plan.id });

      res.status(201).json({
        message: 'Daily plan generated successfully',
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDailyPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const planId = parseInt(req.params.id, 10);
      const updates = req.body;

      const plan = await this.dailyPlanService.updateDailyPlan(planId, userId, updates);

      logger.info('Daily plan updated', { userId, planId });

      res.status(200).json({
        message: 'Daily plan updated successfully',
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDailyPlans(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const plans = await this.dailyPlanService.getDailyPlans(babyId, userId, startDate, endDate);

      res.status(200).json({
        message: 'Daily plans retrieved successfully',
        data: plans,
      });
    } catch (error) {
      next(error);
    }
  }
}

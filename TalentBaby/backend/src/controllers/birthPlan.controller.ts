import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { BirthPlanService } from '../services/birthPlan.service';
import { logger } from '../utils/logger';

export class BirthPlanController {
  private birthPlanService: BirthPlanService;

  constructor() {
    this.birthPlanService = new BirthPlanService();
  }

  async getBirthPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const pregnancyId = req.query.pregnancyId ? parseInt(req.query.pregnancyId as string, 10) : undefined;

      const birthPlan = await this.birthPlanService.getBirthPlan(userId, pregnancyId);

      res.status(200).json({
        message: 'Birth plan retrieved successfully',
        data: birthPlan,
      });
    } catch (error) {
      next(error);
    }
  }

  async createBirthPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const birthPlan = await this.birthPlanService.createBirthPlan(userId, req.body);

      logger.info('Birth plan created', { userId, birthPlanId: birthPlan.id });

      res.status(201).json({
        message: 'Birth plan created successfully',
        data: birthPlan,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBirthPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const birthPlanId = parseInt(req.params.id, 10);
      const birthPlan = await this.birthPlanService.updateBirthPlan(birthPlanId, userId, req.body.plan_content);

      res.status(200).json({
        message: 'Birth plan updated successfully',
        data: birthPlan,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteBirthPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const birthPlanId = parseInt(req.params.id, 10);
      await this.birthPlanService.deleteBirthPlan(birthPlanId, userId);

      res.status(200).json({
        message: 'Birth plan deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

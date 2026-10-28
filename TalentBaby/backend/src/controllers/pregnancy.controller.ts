import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PregnancyService } from '../services/pregnancy.service';
import { logger } from '../utils/logger';

export class PregnancyController {
  private pregnancyService: PregnancyService;

  constructor() {
    this.pregnancyService = new PregnancyService();
  }

  async getPregnancy(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const pregnancy = await this.pregnancyService.getPregnancy(userId);

      res.status(200).json({
        message: 'Pregnancy profile retrieved successfully',
        data: pregnancy,
      });
    } catch (error) {
      next(error);
    }
  }

  async createPregnancy(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const pregnancyData = req.body;

      // Calculate due date if LMP or conception date provided
      if (pregnancyData.lmp_date && !pregnancyData.due_date) {
        pregnancyData.due_date = await this.pregnancyService.calculateDueDate(
          new Date(pregnancyData.lmp_date)
        );
      } else if (pregnancyData.conception_date && !pregnancyData.due_date) {
        pregnancyData.due_date = await this.pregnancyService.calculateFromConception(
          new Date(pregnancyData.conception_date)
        );
      }

      const pregnancy = await this.pregnancyService.createPregnancy(userId, pregnancyData);

      logger.info('Pregnancy profile created', { userId, pregnancyId: pregnancy.id });

      res.status(201).json({
        message: 'Pregnancy profile created successfully',
        data: pregnancy,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePregnancy(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const pregnancyId = parseInt(req.params.id, 10);
      const updates = req.body;

      const pregnancy = await this.pregnancyService.updatePregnancy(pregnancyId, userId, updates);

      logger.info('Pregnancy profile updated', { userId, pregnancyId });

      res.status(200).json({
        message: 'Pregnancy profile updated successfully',
        data: pregnancy,
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePregnancy(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const pregnancyId = parseInt(req.params.id, 10);

      await this.pregnancyService.deletePregnancy(pregnancyId, userId);

      logger.info('Pregnancy profile deleted', { userId, pregnancyId });

      res.status(200).json({
        message: 'Pregnancy profile deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

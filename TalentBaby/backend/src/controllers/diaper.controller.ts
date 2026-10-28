import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { DiaperService } from '../services/diaper.service';
import { logger } from '../utils/logger';

export class DiaperController {
  private diaperService: DiaperService;

  constructor() {
    this.diaperService = new DiaperService();
  }

  async getDiaperChanges(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const changes = await this.diaperService.getDiaperChanges(babyId, userId, startDate, endDate);

      res.status(200).json({
        message: 'Diaper changes retrieved successfully',
        data: changes,
      });
    } catch (error) {
      next(error);
    }
  }

  async createDiaperChange(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const diaperData = req.body;
      const babyId = diaperData.baby_id;

      const change = await this.diaperService.createDiaperChange(babyId, userId, diaperData);

      logger.info('Diaper change created', { userId, babyId, changeId: change.id });

      res.status(201).json({
        message: 'Diaper change created successfully',
        data: change,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDiaperChange(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const changeId = parseInt(req.params.id, 10);
      const updates = req.body;

      const change = await this.diaperService.updateDiaperChange(changeId, userId, updates);

      logger.info('Diaper change updated', { userId, changeId });

      res.status(200).json({
        message: 'Diaper change updated successfully',
        data: change,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteDiaperChange(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const changeId = parseInt(req.params.id, 10);

      await this.diaperService.deleteDiaperChange(changeId, userId);

      logger.info('Diaper change deleted', { userId, changeId });

      res.status(200).json({
        message: 'Diaper change deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getDailySummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);
      const date = new Date(req.query.date as string);

      const summary = await this.diaperService.getDailySummary(babyId, userId, date);

      res.status(200).json({
        message: 'Daily diaper summary retrieved successfully',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      const statistics = await this.diaperService.getStatistics(babyId, userId, startDate, endDate);

      res.status(200).json({
        message: 'Diaper statistics retrieved successfully',
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDiaperPatterns(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;

      const patterns = await this.diaperService.getDiaperPatterns(babyId, userId, days);

      res.status(200).json({
        message: 'Diaper patterns retrieved successfully',
        data: patterns,
      });
    } catch (error) {
      next(error);
    }
  }
}

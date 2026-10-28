import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { SleepService } from '../services/sleep.service';
import { logger } from '../utils/logger';

export class SleepController {
  private sleepService: SleepService;

  constructor() {
    this.sleepService = new SleepService();
  }

  async getSleepSessions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const sessions = await this.sleepService.getSleepSessions(babyId, userId, startDate, endDate);

      res.status(200).json({
        message: 'Sleep sessions retrieved successfully',
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  }

  async createSleepSession(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const sleepData = req.body;
      const babyId = sleepData.baby_id;

      const session = await this.sleepService.createSleepSession(babyId, userId, sleepData);

      logger.info('Sleep session created', { userId, babyId, sessionId: session.id });

      res.status(201).json({
        message: 'Sleep session created successfully',
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSleepSession(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const sessionId = parseInt(req.params.id, 10);
      const updates = req.body;

      const session = await this.sleepService.updateSleepSession(sessionId, userId, updates);

      logger.info('Sleep session updated', { userId, sessionId });

      res.status(200).json({
        message: 'Sleep session updated successfully',
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSleepSession(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const sessionId = parseInt(req.params.id, 10);

      await this.sleepService.deleteSleepSession(sessionId, userId);

      logger.info('Sleep session deleted', { userId, sessionId });

      res.status(200).json({
        message: 'Sleep session deleted successfully',
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

      const statistics = await this.sleepService.getStatistics(babyId, userId, startDate, endDate);

      res.status(200).json({
        message: 'Sleep statistics retrieved successfully',
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSleepPatterns(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;

      const patterns = await this.sleepService.getSleepPatterns(babyId, userId, days);

      res.status(200).json({
        message: 'Sleep patterns retrieved successfully',
        data: patterns,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSleepRecommendations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);

      const recommendations = await this.sleepService.getSleepRecommendations(babyId, userId);

      res.status(200).json({
        message: 'Sleep recommendations retrieved successfully',
        data: recommendations,
      });
    } catch (error) {
      next(error);
    }
  }
}

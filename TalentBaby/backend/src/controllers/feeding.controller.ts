import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { FeedingService } from '../services/feeding.service';
import { logger } from '../utils/logger';

export class FeedingController {
  private feedingService: FeedingService;

  constructor() {
    this.feedingService = new FeedingService();
  }

  async getFeedings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const feedings = await this.feedingService.getFeedings(babyId, userId, startDate, endDate);

      res.status(200).json({
        message: 'Feedings retrieved successfully',
        data: feedings,
      });
    } catch (error) {
      next(error);
    }
  }

  async createFeeding(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const feedingData = req.body;
      const babyId = feedingData.baby_id;

      const feeding = await this.feedingService.createFeeding(babyId, userId, feedingData);

      logger.info('Feeding record created', { userId, babyId, feedingId: feeding.id });

      res.status(201).json({
        message: 'Feeding record created successfully',
        data: feeding,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateFeeding(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const feedingId = parseInt(req.params.id, 10);
      const updates = req.body;

      const feeding = await this.feedingService.updateFeeding(feedingId, userId, updates);

      logger.info('Feeding record updated', { userId, feedingId });

      res.status(200).json({
        message: 'Feeding record updated successfully',
        data: feeding,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteFeeding(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const feedingId = parseInt(req.params.id, 10);

      await this.feedingService.deleteFeeding(feedingId, userId);

      logger.info('Feeding record deleted', { userId, feedingId });

      res.status(200).json({
        message: 'Feeding record deleted successfully',
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

      const statistics = await this.feedingService.getStatistics(babyId, userId, startDate, endDate);

      res.status(200).json({
        message: 'Feeding statistics retrieved successfully',
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeedingPatterns(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;

      const patterns = await this.feedingService.getFeedingPatterns(babyId, userId, days);

      res.status(200).json({
        message: 'Feeding patterns retrieved successfully',
        data: patterns,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeedingRecommendations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);

      const recommendations = await this.feedingService.getFeedingRecommendations(babyId, userId);

      res.status(200).json({
        message: 'Feeding recommendations retrieved successfully',
        data: recommendations,
      });
    } catch (error) {
      next(error);
    }
  }
}

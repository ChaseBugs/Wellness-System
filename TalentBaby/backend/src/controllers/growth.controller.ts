import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { GrowthService } from '../services/growth.service';
import { logger } from '../utils/logger';

export class GrowthController {
  private growthService: GrowthService;

  constructor() {
    this.growthService = new GrowthService();
  }

  async getGrowthRecords(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);

      const records = await this.growthService.getGrowthRecords(babyId, userId);

      res.status(200).json({
        message: 'Growth records retrieved successfully',
        data: records,
      });
    } catch (error) {
      next(error);
    }
  }

  async createGrowthRecord(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const growthData = req.body;
      const babyId = growthData.baby_id;

      const record = await this.growthService.createGrowthRecord(babyId, userId, growthData);

      logger.info('Growth record created', { userId, babyId, recordId: record.id });

      res.status(201).json({
        message: 'Growth record created successfully',
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateGrowthRecord(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const recordId = parseInt(req.params.id, 10);
      const updates = req.body;

      const record = await this.growthService.updateGrowthRecord(recordId, userId, updates);

      logger.info('Growth record updated', { userId, recordId });

      res.status(200).json({
        message: 'Growth record updated successfully',
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteGrowthRecord(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const recordId = parseInt(req.params.id, 10);

      await this.growthService.deleteGrowthRecord(recordId, userId);

      logger.info('Growth record deleted', { userId, recordId });

      res.status(200).json({
        message: 'Growth record deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getGrowthChart(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);

      const chartData = await this.growthService.getGrowthChart(babyId, userId);

      res.status(200).json({
        message: 'Growth chart data retrieved successfully',
        data: chartData,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEnhancedGrowthChart(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);
      const metric = req.params.metric || 'weight';
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const chartData = await this.growthService.getEnhancedGrowthChart(babyId, userId, metric, startDate, endDate);

      res.status(200).json({
        message: 'Enhanced growth chart data retrieved successfully',
        data: chartData,
      });
    } catch (error) {
      next(error);
    }
  }
}

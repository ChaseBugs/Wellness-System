import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ReportService } from '../services/report.service';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  async generateGrowthReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      const report = await this.reportService.generateGrowthReport(babyId, userId, startDate, endDate);

      res.status(200).json({
        message: 'Growth report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  async generateFeedingReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      const report = await this.reportService.generateFeedingReport(babyId, userId, startDate, endDate);

      res.status(200).json({
        message: 'Feeding report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  async generateSleepReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      const report = await this.reportService.generateSleepReport(babyId, userId, startDate, endDate);

      res.status(200).json({
        message: 'Sleep report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  async generateDevelopmentReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);

      const report = await this.reportService.generateDevelopmentReport(babyId, userId);

      res.status(200).json({
        message: 'Development report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }
}

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PregnancyWeekService } from '../services/pregnancyWeek.service';

export class PregnancyWeekController {
  private pregnancyWeekService: PregnancyWeekService;

  constructor() {
    this.pregnancyWeekService = new PregnancyWeekService();
  }

  async getWeekContent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const weekNumber = parseInt(req.params.weekNumber, 10);
      const week = await this.pregnancyWeekService.getWeekContent(weekNumber);

      res.status(200).json({
        message: 'Week content retrieved successfully',
        data: week,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllWeeks(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const weeks = await this.pregnancyWeekService.getAllWeeks();

      res.status(200).json({
        message: 'All weeks retrieved successfully',
        data: weeks,
      });
    } catch (error) {
      next(error);
    }
  }

  async getWeekRange(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const startWeek = parseInt(req.query.startWeek as string, 10);
      const endWeek = parseInt(req.query.endWeek as string, 10);

      const weeks = await this.pregnancyWeekService.getWeekRange(startWeek, endWeek);

      res.status(200).json({
        message: 'Week range retrieved successfully',
        data: weeks,
      });
    } catch (error) {
      next(error);
    }
  }
}

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { DailyUpdateService } from '../services/dailyUpdate.service';

export class DailyUpdateController {
  private dailyUpdateService: DailyUpdateService;

  constructor() {
    this.dailyUpdateService = new DailyUpdateService();
  }

  async getDailyUpdates(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const babyId = parseInt(req.params.babyId, 10);

      const updates = await this.dailyUpdateService.getDailyUpdates(babyId);

      res.status(200).json({
        message: 'Daily updates retrieved successfully',
        data: updates,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTodayUpdate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const babyId = parseInt(req.params.babyId, 10);
      const updates = await this.dailyUpdateService.getDailyUpdates(babyId);
      res.status(200).json({
        message: "Today's daily update retrieved successfully",
        data: updates,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllUpdates(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ageInMonths = parseInt(req.params.ageInMonths, 10);
      const contentType = req.query.contentType as string | undefined;

      const updates = await this.dailyUpdateService.getAllUpdates(ageInMonths, contentType);

      res.status(200).json({
        message: 'Updates retrieved successfully',
        data: updates,
      });
    } catch (error) {
      next(error);
    }
  }
}

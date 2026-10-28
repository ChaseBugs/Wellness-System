import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ExpertClassService } from '../services/expertClass.service';
import { logger } from '../utils/logger';

export class ExpertClassController {
  private classService: ExpertClassService;

  constructor() {
    this.classService = new ExpertClassService();
  }

  async getClasses(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const classType = req.query.type as string | undefined;
      const category = req.query.category as string | undefined;
      const isPremium = req.query.premium === 'true' ? true : undefined;

      const classes = await this.classService.getClasses(classType, category, isPremium);

      res.status(200).json({
        message: 'Expert classes retrieved successfully',
        data: classes,
      });
    } catch (error) {
      next(error);
    }
  }

  async getClass(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = parseInt(req.params.id, 10);
      const classData = await this.classService.getClass(classId);

      res.status(200).json({
        message: 'Class retrieved successfully',
        data: classData,
      });
    } catch (error) {
      next(error);
    }
  }

  async enrollInClass(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const classId = parseInt(req.params.id, 10);

      await this.classService.enrollUser(userId, classId);

      logger.info('User enrolled in class', { userId, classId });

      res.status(200).json({
        message: 'Enrolled in class successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getEnrolledClasses(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const classes = await this.classService.getEnrolledClasses(userId);

      res.status(200).json({
        message: 'Enrolled classes retrieved successfully',
        data: classes,
      });
    } catch (error) {
      next(error);
    }
  }

  async markCompleted(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const classId = parseInt(req.params.id, 10);

      await this.classService.markCompleted(userId, classId);

      res.status(200).json({
        message: 'Class marked as completed',
      });
    } catch (error) {
      next(error);
    }
  }
}

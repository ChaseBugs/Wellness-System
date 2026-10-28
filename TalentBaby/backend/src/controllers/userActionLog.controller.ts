import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserActionLogService } from '../services/userActionLog.service';
import { AppError } from '../middleware/errorHandler';

export class UserActionLogController {
  private userActionLogService: UserActionLogService;

  constructor() {
    this.userActionLogService = new UserActionLogService();
  }

  async getUserActionLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

      const logs = await this.userActionLogService.getUserActionLogs(userId, limit, offset);

      res.status(200).json({
        message: 'User action logs retrieved successfully',
        data: logs,
        pagination: {
          limit,
          offset,
          total: logs.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getActionLogsByType(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const actionType = req.params.actionType;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

      const logs = await this.userActionLogService.getActionLogsByType(actionType, limit, offset);

      res.status(200).json({
        message: 'Action logs retrieved successfully',
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }

  async getResourceLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const resourceType = req.params.resourceType;
      const resourceId = parseInt(req.params.resourceId, 10);

      const logs = await this.userActionLogService.getResourceLogs(resourceType, resourceId);

      res.status(200).json({
        message: 'Resource logs retrieved successfully',
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLogsByDateRange(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 1000;

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        const error: AppError = new Error('Invalid date range');
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
      }

      const logs = await this.userActionLogService.getLogsByDateRange(startDate, endDate, limit);

      res.status(200).json({
        message: 'Logs retrieved successfully',
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const statistics = await this.userActionLogService.getStatistics(userId, startDate, endDate);

      res.status(200).json({
        message: 'Statistics retrieved successfully',
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  }

  async cleanupOldLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Only allow admins or system to cleanup logs
      const daysToKeep = req.body.daysToKeep || 90;

      const deletedCount = await this.userActionLogService.cleanupOldLogs(daysToKeep);

      res.status(200).json({
        message: 'Old logs cleaned up successfully',
        data: {
          deletedCount,
          daysToKeep,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

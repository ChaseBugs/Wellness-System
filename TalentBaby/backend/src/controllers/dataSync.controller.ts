import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { DataSyncService } from '../services/dataSync.service';

export class DataSyncController {
  private dataSyncService: DataSyncService;

  constructor() {
    this.dataSyncService = new DataSyncService();
  }

  async getSyncData(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const lastSyncTime = req.query.lastSyncTime ? new Date(req.query.lastSyncTime as string) : undefined;

      const syncData = await this.dataSyncService.getSyncData(userId, lastSyncTime);

      res.status(200).json({
        message: 'Sync data retrieved successfully',
        data: syncData,
      });
    } catch (error) {
      next(error);
    }
  }
}

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { VideoShareService } from '../services/videoShare.service';
import { logger } from '../utils/logger';

export class VideoShareController {
  private videoShareService: VideoShareService;

  constructor() {
    this.videoShareService = new VideoShareService();
  }

  async createShare(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const memoryId = parseInt(req.body.memory_id, 10);
      const shareType = req.body.share_type || 'link';
      const expiresInDays = req.body.expires_in_days;

      const share = await this.videoShareService.createShare(memoryId, userId, shareType, expiresInDays);

      logger.info('Video share created', { userId, memoryId, shareId: share.id });

      res.status(201).json({
        message: 'Share link created successfully',
        data: {
          ...share,
          share_url: `${process.env.APP_URL || 'http://localhost:8000'}/share/video/${share.share_token}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getShareByToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const shareToken = req.params.token;
      const share = await this.videoShareService.getShareByToken(shareToken);

      // Get memory details
      const { database } = await import('../config/database');
      const memoryResult = await database.query('SELECT * FROM memories WHERE id = $1', [share.memory_id]);

      res.status(200).json({
        message: 'Share retrieved successfully',
        data: {
          share,
          memory: memoryResult.rows[0] || null,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSharesByMemory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const memoryId = parseInt(req.params.memoryId, 10);

      const shares = await this.videoShareService.getSharesByMemory(memoryId, userId);

      res.status(200).json({
        message: 'Shares retrieved successfully',
        data: shares,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteShare(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const shareId = parseInt(req.params.id, 10);

      await this.videoShareService.deleteShare(shareId, userId);

      res.status(200).json({
        message: 'Share deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

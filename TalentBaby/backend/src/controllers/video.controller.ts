import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { VideoService } from '../services/video.service';
import { logger } from '../utils/logger';

export class VideoController {
  private videoService: VideoService;

  constructor() {
    this.videoService = new VideoService();
  }

  async uploadVideo(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.body.baby_id, 10);
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const memory = await this.videoService.uploadVideo(babyId, userId, file);

      res.status(201).json({
        message: 'Video uploaded successfully',
        data: memory,
      });
    } catch (error) {
      next(error);
    }
  }

  async linkVideoToMilestone(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const milestoneId = parseInt(req.body.milestone_id, 10);
      const memoryId = parseInt(req.body.memory_id, 10);

      await this.videoService.linkVideoToMilestone(milestoneId, memoryId, userId);

      res.status(200).json({
        message: 'Video linked to milestone successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async linkVideoToActivity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyActivityId = parseInt(req.body.baby_activity_id, 10);
      const memoryId = parseInt(req.body.memory_id, 10);

      await this.videoService.linkVideoToActivity(babyActivityId, memoryId, userId);

      res.status(200).json({
        message: 'Video linked to activity successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMilestoneVideos(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const milestoneId = parseInt(req.params.milestoneId, 10);

      const videos = await this.videoService.getMilestoneVideos(milestoneId, userId);

      res.status(200).json({
        message: 'Milestone videos retrieved successfully',
        data: videos,
      });
    } catch (error) {
      next(error);
    }
  }

  async getActivityVideos(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyActivityId = parseInt(req.params.babyActivityId, 10);

      const videos = await this.videoService.getActivityVideos(babyActivityId, userId);

      res.status(200).json({
        message: 'Activity videos retrieved successfully',
        data: videos,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVideoTimeline(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const videos = await this.videoService.getVideoTimeline(babyId, userId, startDate, endDate);

      res.status(200).json({
        message: 'Video timeline retrieved successfully',
        data: videos,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBabyVideos(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);
      const videos = await this.videoService.getVideoTimeline(babyId, userId);
      res.status(200).json({
        message: 'Videos retrieved successfully',
        data: videos,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVideo(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const memoryId = parseInt(req.params.id, 10);
      const metadata = await this.videoService.getVideoMetadata(memoryId, userId);
      res.status(200).json({
        message: 'Video retrieved successfully',
        data: metadata,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteVideo(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const memoryId = parseInt(req.params.id, 10);
      await this.videoService.deleteVideo(memoryId, userId);
      res.status(200).json({ message: 'Video deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getVideoMetadata(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const memoryId = parseInt(req.params.memoryId, 10);

      const metadata = await this.videoService.getVideoMetadata(memoryId, userId);

      res.status(200).json({
        message: 'Video metadata retrieved successfully',
        data: metadata,
      });
    } catch (error) {
      next(error);
    }
  }
}

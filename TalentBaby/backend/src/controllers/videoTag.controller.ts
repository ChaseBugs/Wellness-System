import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { VideoTagService } from '../services/videoTag.service';

export class VideoTagController {
  private videoTagService: VideoTagService;

  constructor() {
    this.videoTagService = new VideoTagService();
  }

  async addTag(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const memoryId = parseInt(req.params.memoryId, 10);
      const tagName = req.body.tag_name;

      await this.videoTagService.addTag(memoryId, userId, tagName);

      res.status(200).json({
        message: 'Tag added successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async removeTag(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const memoryId = parseInt(req.params.memoryId, 10);
      const tagName = req.params.tagName;

      await this.videoTagService.removeTag(memoryId, userId, tagName);

      res.status(200).json({
        message: 'Tag removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getTagsByMemory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const memoryId = parseInt(req.params.memoryId, 10);
      const tags = await this.videoTagService.getTagsByMemory(memoryId);

      res.status(200).json({
        message: 'Tags retrieved successfully',
        data: tags,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMemoriesByTag(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tagName = req.params.tagName;
      const babyId = req.query.babyId ? parseInt(req.query.babyId as string, 10) : undefined;
      const userId = req.userId!;

      const memories = await this.videoTagService.getMemoriesByTag(tagName, babyId, userId);

      res.status(200).json({
        message: 'Memories retrieved successfully',
        data: memories,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllTags(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const babyId = req.query.babyId ? parseInt(req.query.babyId as string, 10) : undefined;
      const userId = req.userId!;

      const tags = await this.videoTagService.getAllTags(babyId, userId);

      res.status(200).json({
        message: 'Tags retrieved successfully',
        data: tags,
      });
    } catch (error) {
      next(error);
    }
  }
}

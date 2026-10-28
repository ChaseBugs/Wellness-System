import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ContentTopicService } from '../services/contentTopic.service';

export class ContentTopicController {
  private contentTopicService: ContentTopicService;

  constructor() {
    this.contentTopicService = new ContentTopicService();
  }

  async getTopics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const topics = await this.contentTopicService.getAllTopics();

      res.status(200).json({
        message: 'Topics retrieved successfully',
        data: topics,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopic(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const topicId = parseInt(req.params.id, 10);
      const contentType = req.query.type as string | undefined;

      const content = await this.contentTopicService.getContentByTopic(topicId, contentType);

      res.status(200).json({
        message: 'Content by topic retrieved successfully',
        data: content,
      });
    } catch (error) {
      next(error);
    }
  }

  async searchContent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const searchTerm = req.query.q as string;
      const contentType = req.query.type as string | undefined;

      if (!searchTerm) {
        res.status(400).json({ error: 'Search term (q) is required' });
        return;
      }

      const results = await this.contentTopicService.searchContent(searchTerm, contentType);

      res.status(200).json({
        message: 'Search results retrieved successfully',
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
}

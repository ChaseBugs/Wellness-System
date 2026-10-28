import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { StoryService } from '../services/story.service';

export class StoryController {
  private storyService: StoryService;

  constructor() {
    this.storyService = new StoryService();
  }

  async getStories(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.query.category as string | undefined;
      const ageMonths = req.query.age_months
        ? parseInt(req.query.age_months as string, 10)
        : req.query.month
        ? parseInt(req.query.month as string, 10)
        : undefined;
      const search = req.query.search as string | undefined;

      const stories = await this.storyService.getStories({ category, ageMonths, search });

      res.status(200).json({
        message: 'Stories retrieved successfully',
        data: stories,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const storyId = parseInt(req.params.id, 10);
      const story = await this.storyService.getStoryById(storyId);

      if (!story) {
        res.status(404).json({ error: 'Story not found' });
        return;
      }

      // Check if favorite
      const userId = req.userId;
      if (userId) {
        const isFavorite = await this.storyService.isFavorite(userId, storyId);
        story.is_favorite = isFavorite;
      }

      res.status(200).json({
        message: 'Story retrieved successfully',
        data: story,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStoryCategories(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await this.storyService.getStoryCategories();

      res.status(200).json({
        message: 'Story categories retrieved successfully',
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  async addToFavorites(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const storyId = parseInt(req.params.id, 10);

      await this.storyService.addToFavorites(userId, storyId);

      res.status(200).json({
        message: 'Story added to favorites successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFromFavorites(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const storyId = parseInt(req.params.id, 10);

      await this.storyService.removeFromFavorites(userId, storyId);

      res.status(200).json({
        message: 'Story removed from favorites successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getFavoriteStories(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const stories = await this.storyService.getFavoriteStories(userId);

      res.status(200).json({
        message: 'Favorite stories retrieved successfully',
        data: stories,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStoryAudio(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const storyId = parseInt(req.params.id, 10);
      const story = await this.storyService.getStoryById(storyId);

      if (!story) {
        res.status(404).json({ error: 'Story not found' });
        return;
      }

      if (!story.audio_url) {
        res.status(404).json({ error: 'Audio not available for this story' });
        return;
      }

      res.status(200).json({
        message: 'Story audio retrieved successfully',
        data: { audio_url: story.audio_url, title: story.title, duration_minutes: story.duration_minutes },
      });
    } catch (error) {
      next(error);
    }
  }
}

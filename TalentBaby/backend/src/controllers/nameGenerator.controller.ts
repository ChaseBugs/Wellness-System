import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { NameGeneratorService } from '../services/nameGenerator.service';

export class NameGeneratorController {
  private nameGeneratorService: NameGeneratorService;

  constructor() {
    this.nameGeneratorService = new NameGeneratorService();
  }

  async generateNames(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gender = req.query.gender as string | undefined;
      const origin = req.query.origin as string | undefined;
      const meaning = req.query.meaning as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const names = await this.nameGeneratorService.generateNames(gender, origin, meaning, limit);

      res.status(200).json({
        message: 'Names generated successfully',
        data: names,
      });
    } catch (error) {
      next(error);
    }
  }

  async searchNames(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const searchTerm = req.query.q as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      if (!searchTerm) {
        res.status(400).json({ error: 'Search term is required' });
        return;
      }

      const names = await this.nameGeneratorService.searchNames(searchTerm, limit);

      res.status(200).json({
        message: 'Names found successfully',
        data: names,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPopularNames(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gender = req.query.gender as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const names = await this.nameGeneratorService.getPopularNames(gender, limit);

      res.status(200).json({
        message: 'Popular names retrieved successfully',
        data: names,
      });
    } catch (error) {
      next(error);
    }
  }
}

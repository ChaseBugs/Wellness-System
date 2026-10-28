import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { BabyService } from '../services/baby.service';
import { logger } from '../utils/logger';

export class BabyController {
  private babyService: BabyService;

  constructor() {
    this.babyService = new BabyService();
  }

  async getBabies(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babies = await this.babyService.getBabies(userId);
      res.status(200).json({ message: 'Babies retrieved successfully', data: babies });
    } catch (error) {
      next(error);
    }
  }

  async getAllBabies(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const babies = await this.babyService.getAllBabies();
      res.status(200).json({ message: 'All babies retrieved successfully', data: babies });
    } catch (error) {
      next(error);
    }
  }

  async getActiveBaby(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const baby = await this.babyService.getActiveBaby(userId);
      if (!baby) {
        res.status(404).json({ message: 'No active baby found', data: null });
        return;
      }
      res.status(200).json({ message: 'Active baby retrieved successfully', data: baby });
    } catch (error) {
      next(error);
    }
  }

  async getBabyById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.id, 10);

      const baby = await this.babyService.getBabyById(babyId, userId);

      res.status(200).json({
        message: 'Baby retrieved successfully',
        data: baby,
      });
    } catch (error) {
      next(error);
    }
  }

  async createBaby(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyData = req.body;

      const baby = await this.babyService.createBaby(userId, babyData);

      logger.info('Baby profile created', { userId, babyId: baby.id });

      res.status(201).json({
        message: 'Baby profile created successfully',
        data: baby,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBaby(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.id, 10);
      const updates = req.body;

      const baby = await this.babyService.updateBaby(babyId, userId, updates);

      logger.info('Baby profile updated', { userId, babyId });

      res.status(200).json({
        message: 'Baby profile updated successfully',
        data: baby,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteBaby(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.id, 10);

      await this.babyService.deleteBaby(babyId, userId);

      logger.info('Baby profile deleted', { userId, babyId });

      res.status(200).json({
        message: 'Baby profile deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

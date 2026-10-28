import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { NutritionService } from '../services/nutrition.service';

export class NutritionController {
  private nutritionService: NutritionService;

  constructor() {
    this.nutritionService = new NutritionService();
  }

  async getNutritionByTrimester(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const trimester = parseInt(req.params.trimester, 10);
      const guides = await this.nutritionService.getNutritionByTrimester(trimester);

      res.status(200).json({
        message: 'Nutrition guides retrieved successfully',
        data: guides,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllNutrition(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const guides = await this.nutritionService.getAllNutrition();

      res.status(200).json({
        message: 'All nutrition guides retrieved successfully',
        data: guides,
      });
    } catch (error) {
      next(error);
    }
  }

  async getNutrition(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const guide = await this.nutritionService.getNutrition(id);

      res.status(200).json({
        message: 'Nutrition guide retrieved successfully',
        data: guide,
      });
    } catch (error) {
      next(error);
    }
  }
}

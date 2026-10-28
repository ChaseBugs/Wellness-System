import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ProfileService } from '../services/profile.service';

export class ProfileController {
  private profileService: ProfileService;

  constructor() {
    this.profileService = new ProfileService();
  }

  async getBabyProfiles(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const profiles = await this.profileService.getBabyProfiles(userId);

      res.status(200).json({
        message: 'Baby profiles retrieved successfully',
        data: profiles,
      });
    } catch (error) {
      next(error);
    }
  }

  async switchActiveProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.body.baby_id, 10);

      const profile = await this.profileService.switchActiveProfile(userId, babyId);

      res.status(200).json({
        message: 'Active profile switched successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfileSpecificData(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);
      const dataType = req.params.dataType || 'summary';

      const data = await this.profileService.getProfileSpecificData(babyId, userId, dataType);

      res.status(200).json({
        message: 'Profile data retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

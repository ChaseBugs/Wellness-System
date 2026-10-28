import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { GuideService } from '../services/guide.service';
import { BabyRepository } from '../repositories/baby.repository';

export class GuideController {
  private guideService: GuideService;
  private babyRepository: BabyRepository;

  constructor() {
    this.guideService = new GuideService();
    this.babyRepository = new BabyRepository();
  }

  private calculateAgeMonths(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    return Math.max(0, months);
  }

  // Sleep Guide Methods
  async getSleepGuide(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ageMonths = req.query.age_months ? parseInt(req.query.age_months as string, 10) : undefined;
      const babyId = req.query.baby_id ? parseInt(req.query.baby_id as string, 10) : undefined;

      let finalAgeMonths = ageMonths;
      if (!finalAgeMonths && babyId) {
        const baby = await this.babyRepository.findById(babyId);
        if (baby && baby.birth_date) {
          finalAgeMonths = this.calculateAgeMonths(new Date(baby.birth_date));
        }
      }

      if (!finalAgeMonths && finalAgeMonths !== 0) {
        res.status(400).json({ error: 'age_months or baby_id is required' });
        return;
      }

      const guide = await this.guideService.getSleepGuide(finalAgeMonths!);

      res.status(200).json({
        message: 'Sleep guide retrieved successfully',
        data: guide,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSleepTips(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ageMonths = parseInt(req.query.age_months as string, 10);
      if (!ageMonths && ageMonths !== 0) {
        res.status(400).json({ error: 'age_months is required' });
        return;
      }

      const tips = await this.guideService.getSleepTips(ageMonths);

      res.status(200).json({
        message: 'Sleep tips retrieved successfully',
        data: tips,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSleepSchedule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ageMonths = parseInt(req.query.age_months as string, 10);
      if (!ageMonths && ageMonths !== 0) {
        res.status(400).json({ error: 'age_months is required' });
        return;
      }

      const schedule = await this.guideService.getSleepSchedule(ageMonths);

      res.status(200).json({
        message: 'Sleep schedule retrieved successfully',
        data: schedule,
      });
    } catch (error) {
      next(error);
    }
  }

  // Feeding Guide Methods
  async getFeedingGuide(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ageMonths = req.query.age_months ? parseInt(req.query.age_months as string, 10) : undefined;
      const babyId = req.query.baby_id ? parseInt(req.query.baby_id as string, 10) : undefined;

      let finalAgeMonths = ageMonths;
      if (!finalAgeMonths && babyId) {
        const baby = await this.babyRepository.findById(babyId);
        if (baby && baby.birth_date) {
          finalAgeMonths = this.calculateAgeMonths(new Date(baby.birth_date));
        }
      }

      if (!finalAgeMonths && finalAgeMonths !== 0) {
        res.status(400).json({ error: 'age_months or baby_id is required' });
        return;
      }

      const guide = await this.guideService.getFeedingGuide(finalAgeMonths!);

      res.status(200).json({
        message: 'Feeding guide retrieved successfully',
        data: guide,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeedingTips(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ageMonths = parseInt(req.query.age_months as string, 10);
      if (!ageMonths && ageMonths !== 0) {
        res.status(400).json({ error: 'age_months is required' });
        return;
      }

      const tips = await this.guideService.getFeedingTips(ageMonths);

      res.status(200).json({
        message: 'Feeding tips retrieved successfully',
        data: tips,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeedingAgeGuide(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ageMonths = parseInt(req.query.age_months as string, 10);
      if (!ageMonths && ageMonths !== 0) {
        res.status(400).json({ error: 'age_months is required' });
        return;
      }

      const timeline = await this.guideService.getFoodIntroductionTimeline(ageMonths);
      const schedule = await this.guideService.getFeedingSchedule(ageMonths);

      res.status(200).json({
        message: 'Age-by-age feeding guide retrieved successfully',
        data: {
          timeline,
          schedule,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeedingAdequacy(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const babyId = parseInt(req.query.baby_id as string, 10);
      if (!babyId) {
        res.status(400).json({ error: 'baby_id is required' });
        return;
      }

      const baby = await this.babyRepository.findById(babyId);
      if (!baby || !baby.birth_date) {
        res.status(404).json({ error: 'Baby not found' });
        return;
      }

      const ageMonths = this.calculateAgeMonths(new Date(baby.birth_date));
      const assessment = await this.guideService.getFeedingAdequacyAssessment(babyId, ageMonths);

      res.status(200).json({
        message: 'Feeding adequacy assessment retrieved successfully',
        data: assessment,
      });
    } catch (error) {
      next(error);
    }
  }
}

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { TalentAssessmentService } from '../services/talentAssessment.service';
import { logger } from '../utils/logger';

export class TalentAssessmentController {
  private assessmentService: TalentAssessmentService;

  constructor() {
    this.assessmentService = new TalentAssessmentService();
  }

  async getQuestions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);
      const talentCategoryId = parseInt(req.params.talentCategoryId, 10);

      const questions = await this.assessmentService.getQuestions(babyId, talentCategoryId, userId);

      res.status(200).json({
        message: 'Assessment questions retrieved successfully',
        data: questions,
      });
    } catch (error) {
      next(error);
    }
  }

  async createAssessment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { baby_id, talent_category_id, answers } = req.body;

      const assessment = await this.assessmentService.createAssessment(
        baby_id,
        talent_category_id,
        userId,
        answers
      );

      logger.info('Talent assessment created', { userId, babyId: baby_id, assessmentId: assessment.id });

      res.status(201).json({
        message: 'Assessment completed successfully',
        data: assessment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAssessmentHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);
      const talentCategoryId = parseInt(req.params.talentCategoryId, 10);

      const history = await this.assessmentService.getAssessmentHistory(babyId, talentCategoryId, userId);

      res.status(200).json({
        message: 'Assessment history retrieved successfully',
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }
}

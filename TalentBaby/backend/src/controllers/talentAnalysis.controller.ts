import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { TalentAnalysisService } from '../services/talentAnalysis.service';

export class TalentAnalysisController {
  private talentAnalysisService: TalentAnalysisService;

  constructor() {
    this.talentAnalysisService = new TalentAnalysisService();
  }

  async analyzeTalent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);

      const analysis = await this.talentAnalysisService.analyzeBabyTalent(babyId, userId);

      res.status(200).json({
        message: 'Talent analysis completed successfully',
        data: analysis,
      });
    } catch (error) {
      next(error);
    }
  }
}

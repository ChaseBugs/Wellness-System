import { Router } from 'express';
import { TalentAnalysisController } from '../controllers/talentAnalysis.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const talentAnalysisController = new TalentAnalysisController();

router.get('/baby/:babyId/analyze', authenticate, talentAnalysisController.analyzeTalent.bind(talentAnalysisController));

export default router;

import { Router } from 'express';
import { TalentController } from '../controllers/talent.controller';
import { TalentAssessmentController } from '../controllers/talentAssessment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const talentController = new TalentController();
const assessmentController = new TalentAssessmentController();

router.get('/categories', authenticate, talentController.getCategories.bind(talentController));
router.get('/baby/:babyId/assessments', authenticate, talentController.getAssessments.bind(talentController));
router.post('/assessments', authenticate, talentController.createAssessment.bind(talentController));
router.get('/baby/:babyId/progress', authenticate, talentController.getProgress.bind(talentController));
router.get('/baby/:babyId/missions', authenticate, talentController.getMissions.bind(talentController));
router.post('/missions', authenticate, talentController.createMission.bind(talentController));

// Enhanced Assessment Routes
router.get('/baby/:babyId/category/:talentCategoryId/questions', authenticate, assessmentController.getQuestions.bind(assessmentController));
router.post('/assessments/complete', authenticate, assessmentController.createAssessment.bind(assessmentController));
router.get('/baby/:babyId/category/:talentCategoryId/history', authenticate, assessmentController.getAssessmentHistory.bind(assessmentController));

export default router;

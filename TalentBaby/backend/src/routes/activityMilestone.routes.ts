import { Router } from 'express';
import { ActivityMilestoneController } from '../controllers/activityMilestone.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const activityMilestoneController = new ActivityMilestoneController();

router.post('/', authenticate, activityMilestoneController.trackMilestone.bind(activityMilestoneController));
router.get('/baby/:babyId', authenticate, activityMilestoneController.getMilestones.bind(activityMilestoneController));

export default router;

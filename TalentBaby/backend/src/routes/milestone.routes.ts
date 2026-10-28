import { Router } from 'express';
import { MilestoneController } from '../controllers/milestone.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const milestoneController = new MilestoneController();

router.get('/baby/:babyId', authenticate, milestoneController.getMilestones.bind(milestoneController));
router.post('/', authenticate, milestoneController.createMilestone.bind(milestoneController));
router.put('/:id', authenticate, milestoneController.updateMilestone.bind(milestoneController));
router.delete('/:id', authenticate, milestoneController.deleteMilestone.bind(milestoneController));

export default router;

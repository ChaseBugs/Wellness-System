import { Router } from 'express';
import { BirthPlanController } from '../controllers/birthPlan.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const birthPlanController = new BirthPlanController();

router.get('/', authenticate, birthPlanController.getBirthPlan.bind(birthPlanController));
router.post('/', authenticate, birthPlanController.createBirthPlan.bind(birthPlanController));
router.put('/:id', authenticate, birthPlanController.updateBirthPlan.bind(birthPlanController));
router.delete('/:id', authenticate, birthPlanController.deleteBirthPlan.bind(birthPlanController));

export default router;

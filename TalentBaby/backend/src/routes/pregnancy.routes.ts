import { Router } from 'express';
import { PregnancyController } from '../controllers/pregnancy.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const pregnancyController = new PregnancyController();

router.get('/', authenticate, pregnancyController.getPregnancy.bind(pregnancyController));
router.post('/', authenticate, pregnancyController.createPregnancy.bind(pregnancyController));
router.put('/:id', authenticate, pregnancyController.updatePregnancy.bind(pregnancyController));
router.delete('/:id', authenticate, pregnancyController.deletePregnancy.bind(pregnancyController));

export default router;

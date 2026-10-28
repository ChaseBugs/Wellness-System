import { Router } from 'express';
import { ExpertClassController } from '../controllers/expertClass.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const classController = new ExpertClassController();

router.get('/', authenticate, classController.getClasses.bind(classController));
router.get('/:id', authenticate, classController.getClass.bind(classController));
router.post('/:id/enroll', authenticate, classController.enrollInClass.bind(classController));
router.get('/enrolled/list', authenticate, classController.getEnrolledClasses.bind(classController));
router.post('/:id/complete', authenticate, classController.markCompleted.bind(classController));

export default router;

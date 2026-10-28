import { Router } from 'express';
import { body } from 'express-validator';
import { SleepController } from '../controllers/sleep.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();
const sleepController = new SleepController();

router.get('/baby/:babyId', authenticate, sleepController.getSleepSessions.bind(sleepController));

router.post(
  '/',
  authenticate,
  [
    body('baby_id').isInt(),
    body('sleep_type').isIn(['nap', 'night', 'bedtime']),
    body('start_time').isISO8601().toDate(),
  ],
  validateRequest,
  sleepController.createSleepSession.bind(sleepController)
);

router.put('/:id', authenticate, sleepController.updateSleepSession.bind(sleepController));
router.delete('/:id', authenticate, sleepController.deleteSleepSession.bind(sleepController));
router.get('/baby/:babyId/statistics', authenticate, sleepController.getStatistics.bind(sleepController));
router.get('/baby/:babyId/patterns', authenticate, sleepController.getSleepPatterns.bind(sleepController));
router.get('/baby/:babyId/recommendations', authenticate, sleepController.getSleepRecommendations.bind(sleepController));

export default router;

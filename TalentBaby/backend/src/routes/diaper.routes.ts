import { Router } from 'express';
import { body } from 'express-validator';
import { DiaperController } from '../controllers/diaper.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();
const diaperController = new DiaperController();

router.get('/baby/:babyId', authenticate, diaperController.getDiaperChanges.bind(diaperController));

router.post(
  '/',
  authenticate,
  [
    body('baby_id').isInt(),
    body('diaper_type').isIn(['wet', 'dirty', 'both']),
    body('change_time').isISO8601().toDate(),
  ],
  validateRequest,
  diaperController.createDiaperChange.bind(diaperController)
);

router.put('/:id', authenticate, diaperController.updateDiaperChange.bind(diaperController));
router.delete('/:id', authenticate, diaperController.deleteDiaperChange.bind(diaperController));
router.get('/baby/:babyId/daily-summary', authenticate, diaperController.getDailySummary.bind(diaperController));
router.get('/baby/:babyId/statistics', authenticate, diaperController.getStatistics.bind(diaperController));
router.get('/baby/:babyId/patterns', authenticate, diaperController.getDiaperPatterns.bind(diaperController));

export default router;

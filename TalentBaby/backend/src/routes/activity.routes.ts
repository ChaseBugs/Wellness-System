import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const c = new ActivityController();

// ─── Sub-category and baby routes (before /:id to avoid conflicts) ─────────
router.get('/sub-categories',                   authenticate, c.getSubCategories.bind(c));
router.get('/baby/:babyId/daily',               authenticate, c.getDailyActivities.bind(c));
router.post('/baby/:babyId/daily/:slot/complete', authenticate, c.completeDailySlot.bind(c));
router.get('/baby/:babyId',                     authenticate, c.getBabyActivities.bind(c));

// ─── Collection and single item ────────────────────────────────────────────
router.get('/',    authenticate, c.getActivities.bind(c));
router.get('/:id', authenticate, c.getActivity.bind(c));

// ─── Activity actions ──────────────────────────────────────────────────────
router.post('/:id/complete',   authenticate, c.completeActivity.bind(c));
router.post('/:id/difficulty', authenticate, c.setDifficultyFeedback.bind(c));

// ─── Admin CRUD ────────────────────────────────────────────────────────────
router.post('/',    authenticate, c.createActivity.bind(c));
router.put('/:id',  authenticate, c.updateActivity.bind(c));
router.delete('/:id', authenticate, c.deleteActivity.bind(c));

export default router;

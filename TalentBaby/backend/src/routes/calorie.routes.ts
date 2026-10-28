import { Router } from 'express';
import { CalorieController } from '../controllers/calorie.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const c = new CalorieController();

// ─── Food DB ──────────────────────────────────────────────────────────────────
// GET /api/v1/calorie/foods              — search foods (?search=chicken&baby=true&age=6)
// GET /api/v1/calorie/foods/:id          — food nutrition detail

router.get('/foods',     authenticate, c.searchFoods.bind(c));
router.get('/foods/:id', authenticate, c.getFoodDetail.bind(c));

// ─── Intake Logs ──────────────────────────────────────────────────────────────
// POST   /api/v1/calorie/logs            — add intake log
// GET    /api/v1/calorie/logs            — get logs (?baby_id=1&date=2026-03-22)
// DELETE /api/v1/calorie/logs/:logId     — delete intake log

router.post('/logs',         authenticate, c.addLog.bind(c));
router.get('/logs',          authenticate, c.getLogs.bind(c));
router.delete('/logs/:logId',authenticate, c.deleteLog.bind(c));

// ─── Analysis ─────────────────────────────────────────────────────────────────
// GET /api/v1/calorie/analysis/daily     — per-meal daily nutrition analysis
//     ?baby_id=1&date=2026-03-22
//     response: recommendation, totals, meal breakdown, per-food detail, alerts
//
// GET /api/v1/calorie/analysis/weekly    — weekly calorie trend
//     ?baby_id=1&date=2026-03-22
//
// GET /api/v1/calorie/recommendation/:babyId — age-based calorie recommendation

router.get('/analysis/daily',             authenticate, c.getDailyAnalysis.bind(c));
router.get('/analysis/weekly',            authenticate, c.getWeeklyTrend.bind(c));
// Meal plan: age-appropriate breakfast/lunch/dinner/snack + per-food nutrition
router.get('/meal-plan/:babyId',          authenticate, c.getMealPlan.bind(c));
router.get('/recommendation/:babyId',     authenticate, c.getRecommendation.bind(c));

export default router;

import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { CalorieService } from '../services/calorie.service';

const service = new CalorieService();

export class CalorieController extends BaseController {
  // ─── Food DB ──────────────────────────────────────────────────────────────

  searchFoods = this.handle(async (req, res) => {
    const { search, baby, category, age } = req.query;
    const data = await service.searchFoods({
      search:       search as string | undefined,
      isBabyFood:   baby === 'true' ? true : baby === 'false' ? false : undefined,
      category:     category as string | undefined,
      minAgeMonths: age ? parseInt(age as string) : undefined,
    });
    this.ok(res, data);
  });

  getFoodDetail = this.handle(async (req, res) => {
    const data = await service.getFoodDetail(this.intParam(req, 'id'));
    this.ok(res, data);
  });

  // ─── Intake Logs ──────────────────────────────────────────────────────────

  addLog = this.handle(async (req, res) => {
    const data = await service.addIntakeLog(this.userId(req), {
      baby_id:   req.body.baby_id  ? parseInt(req.body.baby_id)  : undefined,
      food_id:   parseInt(req.body.food_id),
      log_date:  req.body.log_date,
      meal_type: req.body.meal_type ?? 'snack',
      amount_g:  parseFloat(req.body.amount_g),
      notes:     req.body.notes,
    });
    this.created(res, data);
  });

  getLogs = this.handle(async (req, res) => {
    const babyId = this.intQuery(req, 'baby_id') ?? null;
    const date   = (req.query.date as string) ?? new Date().toISOString().split('T')[0];
    const data   = await service.getIntakeLogs(this.userId(req), babyId, date);
    this.ok(res, data);
  });

  deleteLog = this.handle(async (req, res) => {
    await service.deleteIntakeLog(this.userId(req), this.intParam(req, 'logId'));
    this.ok(res, { message: 'Intake log deleted.' });
  });

  // ─── Analysis ─────────────────────────────────────────────────────────────

  getDailyAnalysis = this.handle(async (req, res) => {
    const babyId = this.intQuery(req, 'baby_id') ?? null;
    const date   = (req.query.date as string) ?? new Date().toISOString().split('T')[0];
    const data   = await service.getDailyAnalysis(this.userId(req), babyId, date);
    this.ok(res, data);
  });

  getWeeklyTrend = this.handle(async (req, res) => {
    const babyId = this.intQuery(req, 'baby_id') ?? null;
    const data   = await service.getWeeklyTrend(this.userId(req), babyId, req.query.date as string | undefined);
    this.ok(res, data);
  });

  getMealPlan = this.handle(async (req, res) => {
    const data = await service.getMealPlan(this.intParam(req, 'babyId'), this.userId(req));
    this.ok(res, data);
  });

  getRecommendation = this.handle(async (req, res) => {
    const data = await service.getRecommendation(this.intParam(req, 'babyId'), this.userId(req));
    this.ok(res, data);
  });
}

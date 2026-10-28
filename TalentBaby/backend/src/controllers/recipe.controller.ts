import { Request } from 'express';
import { BaseController } from './base.controller';
import { RecipeService } from '../services/recipe.service';

const svc = new RecipeService();

export class RecipeController extends BaseController {

  // ─── General ──────────────────────────────────────────────────────────────

  getRecipes = this.handle(async (req, res) => {
    const age_months = req.query.age_months ? parseInt(req.query.age_months as string, 10) : undefined;
    const category   = req.query.category as string | undefined;
    const target     = req.query.target as string | undefined;
    const lang       = (req.query.lang as string) || req.headers['accept-language']?.slice(0, 2) || 'en';
    this.ok(res, await svc.getAllRecipes({ age_months, category, target, lang }));
  });

  getRecipe = this.handle(async (req, res) => {
    this.ok(res, await svc.getRecipeById(this.intParam(req, 'id')));
  });

  addToFavorites = this.handle(async (req, res) => {
    await svc.addToFavorites(this.intParam(req, 'id'), this.userId(req));
    this.ok(res, { message: 'Added to favorites.' });
  });

  removeFromFavorites = this.handle(async (req, res) => {
    await svc.removeFromFavorites(this.intParam(req, 'id'), this.userId(req));
    this.ok(res, { message: 'Removed from favorites.' });
  });

  getFavorites = this.handle(async (req, res) => {
    this.ok(res, await svc.getFavorites(this.userId(req)));
  });

  // ─── Legacy ───────────────────────────────────────────────────────────────

  getDailyRecipeTip = this.handle(async (req, res) => {
    this.ok(res, await svc.getDailyRecipeTip(this.intParam(req, 'babyId'), this.userId(req)));
  });

  getRecipesByAge = this.handle(async (req, res) => {
    this.ok(res, await svc.getRecipesByAge(this.intParam(req, 'babyId'), this.userId(req)));
  });

  getRecipesByType = this.handle(async (req, res) => {
    const babyId = req.query.babyId ? parseInt(req.query.babyId as string, 10) : undefined;
    this.ok(res, await svc.getRecipesByType(req.params.type, babyId, this.userId(req)));
  });

  // ─── Baby ─────────────────────────────────────────────────────────────────

  getBabyAgeGroups = this.handle(async (_req, res) => {
    this.ok(res, svc.getAgeGroups());
  });

  getBabyRecipesByAgeGroup = this.handle(async (req, res) => {
    const mealSlot = req.query.meal_slot as string | undefined;
    const lang = (req.query.lang as string) || 'en';
    this.ok(res, await svc.getBabyRecipesByAgeGroup(req.params.group, mealSlot, lang));
  });

  getBabyRecipesByBabyId = this.handle(async (req, res) => {
    const mealSlot = req.query.meal_slot as string | undefined;
    this.ok(res, await svc.getBabyRecipesByBabyId(this.intParam(req, 'babyId'), this.userId(req), mealSlot));
  });

  getBabyDailyPlan = this.handle(async (req, res) => {
    const date = req.query.date as string | undefined;
    this.ok(res, await svc.getBabyDailyPlan(this.userId(req), this.intParam(req, 'babyId'), date));
  });

  generateBabyDailyPlan = this.handle(async (req, res) => {
    const date = req.body.date as string | undefined;
    this.ok(res, await svc.generateBabyDailyPlan(this.userId(req), this.intParam(req, 'babyId'), date));
  });

  setBabyPlanSlot = this.handle(async (req, res) => {
    const { plan_date, meal_slot, recipe_id, notes } = req.body;
    this.ok(res, await svc.setBabyPlanSlot(this.userId(req), this.intParam(req, 'babyId'), plan_date, meal_slot, recipe_id, notes));
  });

  // ─── Mum ──────────────────────────────────────────────────────────────────

  getMumMealSlots = this.handle(async (_req, res) => {
    this.ok(res, svc.getMumMealSlots());
  });

  getMumRecipes = this.handle(async (req, res) => {
    const mealSlot = req.params.slot as string | undefined;
    const lang = (req.query.lang as string) || 'en';
    this.ok(res, await svc.getMumRecipes(mealSlot, lang));
  });

  getMumDailyPlan = this.handle(async (req, res) => {
    const date = req.query.date as string | undefined;
    this.ok(res, await svc.getMumDailyPlan(this.userId(req), date));
  });

  generateMumDailyPlan = this.handle(async (req, res) => {
    const date = req.body.date as string | undefined;
    this.ok(res, await svc.generateMumDailyPlan(this.userId(req), date));
  });

  setMumPlanSlot = this.handle(async (req, res) => {
    const { plan_date, meal_slot, recipe_id, notes } = req.body;
    this.ok(res, await svc.setMumPlanSlot(this.userId(req), plan_date, meal_slot, recipe_id, notes));
  });

  // ─── Admin CRUD ──────────────────────────────────────────────────────────

  createRecipe = this.handle(async (req, res) => {
    this.created(res, await svc.createRecipe(req.body));
  });

  updateRecipe = this.handle(async (req, res) => {
    this.ok(res, await svc.updateRecipe(this.intParam(req, 'id'), req.body));
  });

  deleteRecipe = this.handle(async (req, res) => {
    await svc.deleteRecipe(this.intParam(req, 'id'));
    this.ok(res, { message: 'Recipe deleted.' });
  });
}

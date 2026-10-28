import { RecipeRepository, Recipe, DailyMealPlan, BABY_AGE_GROUPS, BABY_MEAL_SLOTS, MUM_MEAL_SLOTS } from '../repositories/recipe.repository';
import { database } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class RecipeService {
  private repo: RecipeRepository;

  constructor() {
    this.repo = new RecipeRepository();
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async getBabyAge(babyId: number, userId: number): Promise<{ ageInMonths: number; ageGroup: string }> {
    const res = await database.query(
      'SELECT birth_date FROM babies WHERE id = $1 AND user_id = $2',
      [babyId, userId]
    );
    if (!res.rows[0]) throw Object.assign(new Error('Baby not found'), { statusCode: 404, isOperational: true });
    const months = Math.floor((Date.now() - new Date(res.rows[0].birth_date).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    const group = BABY_AGE_GROUPS.find(g => months >= g.min && months <= g.max);
    return { ageInMonths: months, ageGroup: group?.group ?? '0-6' };
  }

  private ageGroupFromMonths(months: number): string {
    return BABY_AGE_GROUPS.find(g => months >= g.min && months <= g.max)?.group ?? '0-6';
  }

  // ─── General ──────────────────────────────────────────────────────────────

  async getAllRecipes(filters?: { age_months?: number; category?: string; target?: string; lang?: string }): Promise<Recipe[]> {
    return this.repo.findAll(filters);
  }

  async getRecipeById(id: number): Promise<Recipe> {
    const r = await this.repo.findById(id);
    if (!r) throw Object.assign(new Error('Recipe not found'), { statusCode: 404, isOperational: true });
    return r;
  }

  async addToFavorites(recipeId: number, userId: number): Promise<void> {
    await this.getRecipeById(recipeId);
    await this.repo.addToFavorites(userId, recipeId);
  }

  async removeFromFavorites(recipeId: number, userId: number): Promise<void> {
    await this.repo.removeFromFavorites(userId, recipeId);
  }

  async getFavorites(userId: number): Promise<Recipe[]> {
    return this.repo.getFavorites(userId);
  }

  // ─── Legacy (kept for existing routes) ───────────────────────────────────

  async getDailyRecipeTip(babyId: number, userId: number): Promise<Recipe> {
    const { ageInMonths } = await this.getBabyAge(babyId, userId);
    const r = await this.repo.getDailyRecipeTip(ageInMonths);
    if (!r) throw Object.assign(new Error('No recipe available for this age'), { statusCode: 404, isOperational: true });
    return r;
  }

  async getRecipesByAge(babyId: number, userId: number): Promise<Recipe[]> {
    const { ageInMonths } = await this.getBabyAge(babyId, userId);
    return this.repo.findByAge(ageInMonths);
  }

  async getRecipesByType(recipeType: string, babyId?: number, userId?: number): Promise<Recipe[]> {
    let ageInMonths: number | undefined;
    if (babyId && userId) {
      const info = await this.getBabyAge(babyId, userId);
      ageInMonths = info.ageInMonths;
    }
    return this.repo.findByType(recipeType, ageInMonths);
  }

  // ─── Baby ─────────────────────────────────────────────────────────────────

  getAgeGroups() {
    return BABY_AGE_GROUPS.map(g => ({
      group: g.group,
      label: `Month ${g.group}`,
      min_months: g.min,
      max_months: g.max,
      meal_slots: [...BABY_MEAL_SLOTS],
    }));
  }

  async getBabyRecipesByAgeGroup(ageGroup: string, mealSlot?: string, lang = 'en'): Promise<Recipe[]> {
    const valid = BABY_AGE_GROUPS.some(g => g.group === ageGroup);
    if (!valid) throw Object.assign(new Error(`Invalid age group. Valid: ${BABY_AGE_GROUPS.map(g => g.group).join(', ')}`), { statusCode: 400, isOperational: true });
    return this.repo.findBabyByAgeGroup(ageGroup, mealSlot, lang);
  }

  async getBabyRecipesByBabyId(babyId: number, userId: number, mealSlot?: string): Promise<{ ageGroup: string; ageInMonths: number; recipes: Recipe[] }> {
    const { ageInMonths, ageGroup } = await this.getBabyAge(babyId, userId);
    const recipes = await this.repo.findBabyByAgeGroup(ageGroup, mealSlot);
    return { ageGroup, ageInMonths, recipes };
  }

  async getBabyDailyPlan(userId: number, babyId: number, date?: string): Promise<{ date: string; ageGroup: string; plan: DailyMealPlan[] }> {
    const { ageGroup } = await this.getBabyAge(babyId, userId);
    const planDate = date ?? new Date().toISOString().slice(0, 10);
    const plan = await this.repo.getDailyPlan(userId, 'baby', planDate, babyId);
    return { date: planDate, ageGroup, plan };
  }

  async generateBabyDailyPlan(userId: number, babyId: number, date?: string): Promise<{ date: string; ageGroup: string; plan: DailyMealPlan[] }> {
    const { ageGroup } = await this.getBabyAge(babyId, userId);
    const planDate = date ?? new Date().toISOString().slice(0, 10);
    const plan = await this.repo.generateBabyDailyPlan(userId, babyId, ageGroup, planDate);
    return { date: planDate, ageGroup, plan };
  }

  async setBabyPlanSlot(userId: number, babyId: number, planDate: string, mealSlot: string, recipeId?: number, notes?: string): Promise<DailyMealPlan> {
    await this.getBabyAge(babyId, userId);
    if (!BABY_MEAL_SLOTS.includes(mealSlot as any))
      throw Object.assign(new Error(`Invalid meal slot. Valid: ${BABY_MEAL_SLOTS.join(', ')}`), { statusCode: 400, isOperational: true });
    return this.repo.upsertPlanSlot({ userId, babyId, planType: 'baby', planDate, mealSlot, recipeId, notes });
  }

  // ─── Mum ──────────────────────────────────────────────────────────────────

  getMumMealSlots() {
    return MUM_MEAL_SLOTS.map(slot => ({
      slot,
      label: slot.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    }));
  }

  async getMumRecipes(mealSlot?: string, lang = 'en'): Promise<Recipe[]> {
    if (mealSlot && !MUM_MEAL_SLOTS.includes(mealSlot as any))
      throw Object.assign(new Error(`Invalid meal slot. Valid: ${MUM_MEAL_SLOTS.join(', ')}`), { statusCode: 400, isOperational: true });
    return this.repo.findMumRecipes(mealSlot, lang);
  }

  async getMumDailyPlan(userId: number, date?: string): Promise<{ date: string; plan: DailyMealPlan[] }> {
    const planDate = date ?? new Date().toISOString().slice(0, 10);
    const plan = await this.repo.getDailyPlan(userId, 'mum', planDate);
    return { date: planDate, plan };
  }

  async generateMumDailyPlan(userId: number, date?: string): Promise<{ date: string; plan: DailyMealPlan[] }> {
    const planDate = date ?? new Date().toISOString().slice(0, 10);
    const plan = await this.repo.generateMumDailyPlan(userId, planDate);
    return { date: planDate, plan };
  }

  async setMumPlanSlot(userId: number, planDate: string, mealSlot: string, recipeId?: number, notes?: string): Promise<DailyMealPlan> {
    if (!MUM_MEAL_SLOTS.includes(mealSlot as any))
      throw Object.assign(new Error(`Invalid meal slot. Valid: ${MUM_MEAL_SLOTS.join(', ')}`), { statusCode: 400, isOperational: true });
    return this.repo.upsertPlanSlot({ userId, planType: 'mum', planDate, mealSlot, recipeId, notes });
  }

  // ─── Admin CRUD ───────────────────────────────────────────────────────────

  async createRecipe(data: Parameters<RecipeRepository['create']>[0]): Promise<Recipe> {
    return this.repo.create(data);
  }

  async updateRecipe(id: number, data: Parameters<RecipeRepository['update']>[1]): Promise<Recipe> {
    const r = await this.repo.update(id, data);
    if (!r) throw Object.assign(new Error('Recipe not found'), { statusCode: 404, isOperational: true });
    return r;
  }

  async deleteRecipe(id: number): Promise<void> {
    const ok = await this.repo.delete(id);
    if (!ok) throw Object.assign(new Error('Recipe not found'), { statusCode: 404, isOperational: true });
  }
}

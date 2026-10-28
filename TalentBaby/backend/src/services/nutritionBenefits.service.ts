import { NutritionBenefitsRepository } from '../repositories/nutritionBenefits.repository';
import { database } from '../config/database';
import { BABY_AGE_GROUPS } from '../repositories/recipe.repository';
import { AppError } from '../utils/AppError';

const repo = new NutritionBenefitsRepository();

export class NutritionBenefitsService {

  private ageGroupFromMonths(months: number): string {
    return BABY_AGE_GROUPS.find(g => months >= g.min && months <= g.max)?.group ?? '0-6';
  }

  async getCategories(lang?: string) {
    return repo.getAllCategories(lang);
  }

  async getCategoriesWithFoods(ageGroup?: string, vegetarianOnly?: boolean, lang?: string) {
    if (ageGroup) {
      const valid = BABY_AGE_GROUPS.some(g => g.group === ageGroup);
      if (!valid) throw AppError.badRequest(`Invalid age group. Valid: ${BABY_AGE_GROUPS.map(g => g.group).join(', ')}`);
    }
    return repo.getAllCategoriesWithFoods({ ageGroup, vegetarianOnly, lang });
  }

  async getCategoryFoods(categoryId: number, ageGroup?: string, vegetarianOnly?: boolean, lang?: string) {
    const cat = await repo.getCategoryById(categoryId);
    if (!cat) throw AppError.notFound('Nutrition category not found.');
    const foods = await repo.getFoodsByCategory(categoryId, { ageGroup, vegetarianOnly, lang });
    return { category: cat, foods };
  }

  async getFoodById(id: number) {
    const food = await repo.getFoodById(id);
    if (!food) throw AppError.notFound('Nutrition food not found.');
    return food;
  }

  async getFoodsForBaby(babyId: number, userId: number, vegetarianOnly?: boolean) {
    const res = await database.query(
      'SELECT birth_date FROM babies WHERE id = $1 AND user_id = $2',
      [babyId, userId]
    );
    if (!res.rows[0]) throw AppError.notFound('Baby not found.');
    const months = Math.floor((Date.now() - new Date(res.rows[0].birth_date).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    const ageGroup = this.ageGroupFromMonths(months);
    const data = await repo.getAllCategoriesWithFoods({ ageGroup, vegetarianOnly });
    return { ageGroup, ageInMonths: months, categories: data };
  }

  async searchFoods(query: string, ageGroup?: string, vegetarianOnly?: boolean) {
    if (!query?.trim()) throw AppError.badRequest('Search query is required.');
    return repo.searchFoods(query.trim(), { ageGroup, vegetarianOnly });
  }

  // ─── Admin CRUD ───────────────────────────────────────────────────────────

  async createFood(data: Parameters<typeof repo.createFood>[0]) {
    const cat = await repo.getCategoryById(data.category_id);
    if (!cat) throw AppError.notFound('Nutrition category not found.');
    return repo.createFood(data);
  }

  async updateFood(id: number, data: Parameters<typeof repo.updateFood>[1]) {
    if (data?.category_id) {
      const cat = await repo.getCategoryById(data.category_id);
      if (!cat) throw AppError.notFound('Nutrition category not found.');
    }
    const food = await repo.updateFood(id, data);
    if (!food) throw AppError.notFound('Nutrition food not found.');
    return food;
  }

  async deleteFood(id: number) {
    const ok = await repo.deleteFood(id);
    if (!ok) throw AppError.notFound('Nutrition food not found.');
  }
}

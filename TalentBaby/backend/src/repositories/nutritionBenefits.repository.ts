import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface NutritionCategory {
  id: number;
  name: string;
  description?: string;
  icon_url?: string;
  sort_order: number;
}

export interface NutritionFood {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  description?: string;
  image_url?: string;
  is_vegetarian: boolean;
  age_groups?: string;   // stored as comma-separated string
  sort_order: number;
}

export interface NutritionCategoryWithFoods extends NutritionCategory {
  foods: NutritionFood[];
}

export class NutritionBenefitsRepository {

  async getAllCategories(lang?: string): Promise<NutritionCategory[]> {
    const rows = await prisma.nutrition_categories.findMany({
      where: lang ? { language: lang } : undefined,
      orderBy: { sort_order: 'asc' },
    });
    return rows as unknown as NutritionCategory[];
  }

  async getCategoryById(id: number): Promise<NutritionCategory | null> {
    const row = await prisma.nutrition_categories.findUnique({ where: { id } });
    return (row as unknown as NutritionCategory) ?? null;
  }

  async getFoodsByCategory(
    categoryId: number,
    filters?: { ageGroup?: string; vegetarianOnly?: boolean; lang?: string },
  ): Promise<NutritionFood[]> {
    const where: Prisma.nutrition_foodsWhereInput = { category_id: categoryId };

    if (filters?.lang) where.language = filters.lang;
    if (filters?.vegetarianOnly) where.is_vegetarian = true;
    if (filters?.ageGroup) {
      where.OR = [
        { age_groups: null },
        { age_groups: { contains: filters.ageGroup } },
      ];
    }

    const rows = await prisma.nutrition_foods.findMany({
      where,
      orderBy: { sort_order: 'asc' },
      include: { nutrition_categories: true },
    });

    return rows.map((r) => ({
      ...r,
      category_name: r.nutrition_categories.name,
    })) as unknown as NutritionFood[];
  }

  async getAllCategoriesWithFoods(
    filters?: { ageGroup?: string; vegetarianOnly?: boolean; lang?: string },
  ): Promise<NutritionCategoryWithFoods[]> {
    const foodWhere: Prisma.nutrition_foodsWhereInput = {};

    if (filters?.lang) foodWhere.language = filters.lang;
    if (filters?.vegetarianOnly) foodWhere.is_vegetarian = true;
    if (filters?.ageGroup) {
      foodWhere.OR = [
        { age_groups: null },
        { age_groups: { contains: filters.ageGroup } },
      ];
    }

    const [cats, allFoods] = await Promise.all([
      prisma.nutrition_categories.findMany({
        where: filters?.lang ? { language: filters.lang } : undefined,
        orderBy: { sort_order: 'asc' },
      }),
      prisma.nutrition_foods.findMany({
        where: foodWhere,
        orderBy: [{ category_id: 'asc' }, { sort_order: 'asc' }],
        include: { nutrition_categories: true },
      }),
    ]);

    const foodsByCategory: Record<number, NutritionFood[]> = {};
    for (const food of allFoods) {
      const f: NutritionFood = {
        ...(food as unknown as NutritionFood),
        category_name: food.nutrition_categories.name,
      };
      if (!foodsByCategory[food.category_id]) foodsByCategory[food.category_id] = [];
      foodsByCategory[food.category_id].push(f);
    }

    return cats.map((cat) => ({
      ...(cat as unknown as NutritionCategory),
      foods: foodsByCategory[cat.id] ?? [],
    }));
  }

  async getFoodById(id: number): Promise<NutritionFood | null> {
    const row = await prisma.nutrition_foods.findUnique({
      where: { id },
      include: { nutrition_categories: true },
    });
    if (!row) return null;
    return {
      ...(row as unknown as NutritionFood),
      category_name: row.nutrition_categories.name,
    };
  }

  async searchFoods(
    query: string,
    filters?: { ageGroup?: string; vegetarianOnly?: boolean },
  ): Promise<NutritionFood[]> {
    const where: Prisma.nutrition_foodsWhereInput = {
      name: { contains: query, mode: 'insensitive' },
    };

    if (filters?.vegetarianOnly) where.is_vegetarian = true;
    if (filters?.ageGroup) {
      where.OR = [
        { age_groups: null },
        { age_groups: { contains: filters.ageGroup } },
      ];
    }

    const rows = await prisma.nutrition_foods.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { nutrition_categories: true },
    });

    return rows.map((r) => ({
      ...(r as unknown as NutritionFood),
      category_name: r.nutrition_categories.name,
    }));
  }

  // ─── Admin CRUD ────────────────────────────────────────────────────────────

  async createFood(data: {
    category_id: number; name: string; description?: string;
    image_url?: string; is_vegetarian?: boolean; age_groups?: string; sort_order?: number; language?: string;
  }): Promise<NutritionFood> {
    const row = await prisma.nutrition_foods.create({
      data: {
        category_id: data.category_id,
        name: data.name,
        description: data.description ?? null,
        image_url: data.image_url ?? null,
        is_vegetarian: data.is_vegetarian ?? false,
        age_groups: data.age_groups ?? null,
        sort_order: data.sort_order ?? 99,
        language: data.language ?? 'en',
      },
    });
    return row as unknown as NutritionFood;
  }

  async updateFood(
    id: number,
    data: Partial<{
      category_id: number; name: string; description: string;
      image_url: string; is_vegetarian: boolean; age_groups: string; sort_order: number;
    }>,
  ): Promise<NutritionFood | null> {
    const updateData: Prisma.nutrition_foodsUpdateInput = {};

    if (data.category_id !== undefined) {
      updateData.nutrition_categories = { connect: { id: data.category_id } };
    }
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.image_url !== undefined) updateData.image_url = data.image_url;
    if (data.is_vegetarian !== undefined) updateData.is_vegetarian = data.is_vegetarian;
    if (data.age_groups !== undefined) updateData.age_groups = data.age_groups;
    if (data.sort_order !== undefined) updateData.sort_order = data.sort_order;

    if (Object.keys(updateData).length === 0) return this.getFoodById(id);

    const existing = await prisma.nutrition_foods.findUnique({ where: { id } });
    if (!existing) return null;

    const row = await prisma.nutrition_foods.update({ where: { id }, data: updateData });
    return row as unknown as NutritionFood;
  }

  async deleteFood(id: number): Promise<boolean> {
    const result = await prisma.nutrition_foods.deleteMany({ where: { id } });
    return result.count > 0;
  }
}

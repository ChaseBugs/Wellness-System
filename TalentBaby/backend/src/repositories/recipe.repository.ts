import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface Recipe {
  id: number;
  title: string;
  description: string;
  target: 'baby' | 'mum';
  meal_slot?: string;
  baby_age_group?: string;
  age_range_min_months: number;
  age_range_max_months: number;
  recipe_type: string;
  ingredients: string[];
  instructions: string[];
  nutrition_info?: any;
  prep_time_minutes?: number;
  cooking_time_minutes?: number;
  image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DailyMealPlan {
  id: number;
  user_id: number;
  baby_id?: number;
  plan_type: 'baby' | 'mum';
  plan_date: string;
  meal_slot: string;
  recipe_id?: number;
  notes?: string;
  recipe?: Recipe;
}

// ─── Baby age group constants ──────────────────────────────────────────────
export const BABY_AGE_GROUPS = [
  { group: '0-6',   min: 0,  max: 6  },
  { group: '7-11',  min: 7,  max: 11 },
  { group: '12-17', min: 12, max: 17 },
  { group: '18-24', min: 18, max: 24 },
  { group: '25-30', min: 25, max: 30 },
  { group: '31-36', min: 31, max: 36 },
];

export const BABY_MEAL_SLOTS  = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export const MUM_MEAL_SLOTS   = ['early_morning', 'breakfast', 'mid_morning', 'lunch', 'evening', 'dinner', 'bedtime'] as const;

export class RecipeRepository {
  // ─── Existing ─────────────────────────────────────────────────────────────

  async findByAge(ageInMonths: number): Promise<Recipe[]> {
    const rows = await prisma.$queryRaw<Recipe[]>(
      Prisma.sql`SELECT * FROM recipes WHERE age_range_min_months <= ${ageInMonths} AND age_range_max_months >= ${ageInMonths} ORDER BY RANDOM()`
    );
    return rows;
  }

  async findByType(recipeType: string, ageInMonths?: number): Promise<Recipe[]> {
    const rows = await prisma.recipes.findMany({
      where: {
        recipe_type: recipeType,
        ...(ageInMonths
          ? {
              age_range_min_months: { lte: ageInMonths },
              age_range_max_months: { gte: ageInMonths },
            }
          : {}),
      },
      orderBy: { title: 'asc' },
    });
    return rows as unknown as Recipe[];
  }

  async findById(id: number): Promise<Recipe | null> {
    const row = await prisma.recipes.findUnique({ where: { id } });
    return row as unknown as Recipe | null;
  }

  async getDailyRecipeTip(ageInMonths: number): Promise<Recipe | null> {
    const rows = await prisma.$queryRaw<Recipe[]>(
      Prisma.sql`SELECT * FROM recipes WHERE age_range_min_months <= ${ageInMonths} AND age_range_max_months >= ${ageInMonths} ORDER BY RANDOM() LIMIT 1`
    );
    return rows[0] || null;
  }

  async findAll(filters?: { age_months?: number; category?: string; target?: string; lang?: string }): Promise<Recipe[]> {
    const rows = await prisma.recipes.findMany({
      where: {
        ...(filters?.lang ? { language: filters.lang } : {}),
        ...(filters?.age_months
          ? {
              age_range_min_months: { lte: filters.age_months },
              age_range_max_months: { gte: filters.age_months },
            }
          : {}),
        ...(filters?.category ? { recipe_type: filters.category } : {}),
        ...(filters?.target ? { target: filters.target } : {}),
      },
      orderBy: { title: 'asc' },
    });
    return rows as unknown as Recipe[];
  }

  async addToFavorites(userId: number, recipeId: number): Promise<void> {
    await prisma.$executeRaw`INSERT INTO recipe_favorites (user_id, recipe_id) VALUES (${userId}, ${recipeId}) ON CONFLICT (user_id, recipe_id) DO NOTHING`;
  }

  async removeFromFavorites(userId: number, recipeId: number): Promise<void> {
    await prisma.recipe_favorites.deleteMany({
      where: { user_id: userId, recipe_id: recipeId },
    });
  }

  async getFavorites(userId: number): Promise<Recipe[]> {
    const rows = await prisma.$queryRaw<Recipe[]>(
      Prisma.sql`SELECT r.* FROM recipes r INNER JOIN recipe_favorites rf ON r.id = rf.recipe_id WHERE rf.user_id = ${userId} ORDER BY rf.created_at DESC`
    );
    return rows;
  }

  async isFavorite(userId: number, recipeId: number): Promise<boolean> {
    const row = await prisma.recipe_favorites.findUnique({
      where: { user_id_recipe_id: { user_id: userId, recipe_id: recipeId } },
    });
    return row !== null;
  }

  // ─── Baby recipes ──────────────────────────────────────────────────────────

  async findBabyByAgeGroup(ageGroup: string, mealSlot?: string, lang?: string): Promise<Recipe[]> {
    const uiRows = await prisma.$queryRaw<Recipe[]>(
      Prisma.sql`
        SELECT *
        FROM recipes
        WHERE target = 'baby'
          AND baby_age_group = ${ageGroup}
          AND (${lang ?? null}::text IS NULL OR language = ${lang ?? null})
          AND (${mealSlot ?? null}::text IS NULL OR meal_slot = ${mealSlot ?? null})
          AND nutrition_info->>'source' = 'ui/babyG/nutritions'
        ORDER BY title ASC
      `
    );
    if (uiRows.length > 0) return uiRows;

    const rows = await prisma.recipes.findMany({
      where: {
        target: 'baby',
        baby_age_group: ageGroup,
        ...(lang ? { language: lang } : {}),
        ...(mealSlot ? { meal_slot: mealSlot } : {}),
      },
      orderBy: { title: 'asc' },
    });
    return rows as unknown as Recipe[];
  }

  async findBabyByAgeMonths(ageInMonths: number, mealSlot?: string): Promise<Recipe[]> {
    const group = BABY_AGE_GROUPS.find(g => ageInMonths >= g.min && ageInMonths <= g.max);
    const ageGroup = group?.group ?? '0-6';
    return this.findBabyByAgeGroup(ageGroup, mealSlot);
  }

  // ─── Mum recipes ───────────────────────────────────────────────────────────

  async findMumRecipes(mealSlot?: string, lang?: string): Promise<Recipe[]> {
    const rows = await prisma.recipes.findMany({
      where: {
        target: 'mum',
        ...(lang ? { language: lang } : {}),
        ...(mealSlot ? { meal_slot: mealSlot } : {}),
      },
      orderBy: { title: 'asc' },
    });
    return rows as unknown as Recipe[];
  }

  // ─── Daily meal plan ───────────────────────────────────────────────────────

  async getDailyPlan(userId: number, planType: 'baby' | 'mum', planDate: string, babyId?: number): Promise<DailyMealPlan[]> {
    const rows = await prisma.$queryRaw<DailyMealPlan[]>(
      babyId
        ? Prisma.sql`SELECT dmp.*, r.title as recipe_title, r.description as recipe_description,
                            r.image_url, r.prep_time_minutes, r.cooking_time_minutes,
                            r.ingredients, r.instructions, r.nutrition_info,
                            r.meal_slot as recipe_meal_slot, r.target, r.baby_age_group
                     FROM daily_meal_plans dmp
                     LEFT JOIN recipes r ON r.id = dmp.recipe_id
                     WHERE dmp.user_id = ${userId}
                       AND dmp.plan_type = ${planType}
                       AND dmp.plan_date = ${planDate}::date
                       AND dmp.baby_id = ${babyId}
                     ORDER BY dmp.meal_slot`
        : Prisma.sql`SELECT dmp.*, r.title as recipe_title, r.description as recipe_description,
                            r.image_url, r.prep_time_minutes, r.cooking_time_minutes,
                            r.ingredients, r.instructions, r.nutrition_info,
                            r.meal_slot as recipe_meal_slot, r.target, r.baby_age_group
                     FROM daily_meal_plans dmp
                     LEFT JOIN recipes r ON r.id = dmp.recipe_id
                     WHERE dmp.user_id = ${userId}
                       AND dmp.plan_type = ${planType}
                       AND dmp.plan_date = ${planDate}::date
                       AND dmp.baby_id IS NULL
                     ORDER BY dmp.meal_slot`
    );
    return rows;
  }

  async upsertPlanSlot(data: {
    userId: number;
    babyId?: number;
    planType: 'baby' | 'mum';
    planDate: string;
    mealSlot: string;
    recipeId?: number;
    notes?: string;
  }): Promise<DailyMealPlan> {
    const rows = await prisma.$queryRaw<DailyMealPlan[]>(
      Prisma.sql`INSERT INTO daily_meal_plans (user_id, baby_id, plan_type, plan_date, meal_slot, recipe_id, notes)
                 VALUES (${data.userId}, ${data.babyId ?? null}, ${data.planType}, ${data.planDate}::date, ${data.mealSlot}, ${data.recipeId ?? null}, ${data.notes ?? null})
                 ON CONFLICT (user_id, COALESCE(baby_id, -1), plan_type, plan_date, meal_slot)
                 DO UPDATE SET recipe_id = EXCLUDED.recipe_id, notes = EXCLUDED.notes
                 RETURNING *`
    );
    return rows[0];
  }

  async generateBabyDailyPlan(userId: number, babyId: number, ageGroup: string, planDate: string): Promise<DailyMealPlan[]> {
    const plans: DailyMealPlan[] = [];
    for (const slot of BABY_MEAL_SLOTS) {
      const recipes = await this.findBabyByAgeGroup(ageGroup, slot);
      const recipe = recipes[Math.floor(Math.random() * recipes.length)];
      const plan = await this.upsertPlanSlot({
        userId, babyId, planType: 'baby', planDate,
        mealSlot: slot, recipeId: recipe?.id,
      });
      plans.push(plan);
    }
    return plans;
  }

  async generateMumDailyPlan(userId: number, planDate: string): Promise<DailyMealPlan[]> {
    const plans: DailyMealPlan[] = [];
    for (const slot of MUM_MEAL_SLOTS) {
      const recipes = await this.findMumRecipes(slot);
      const recipe = recipes[Math.floor(Math.random() * recipes.length)];
      const plan = await this.upsertPlanSlot({
        userId, planType: 'mum', planDate,
        mealSlot: slot, recipeId: recipe?.id,
      });
      plans.push(plan);
    }
    return plans;
  }

  // ─── Admin CRUD ────────────────────────────────────────────────────────────

  async create(data: {
    title: string; description?: string; target: 'baby' | 'mum';
    meal_slot?: string; baby_age_group?: string;
    age_range_min_months: number; age_range_max_months: number;
    recipe_type: string; ingredients?: string[]; instructions?: string[];
    nutrition_info?: any; prep_time_minutes?: number; cooking_time_minutes?: number;
    image_url?: string; language?: string;
  }): Promise<Recipe> {
    const row = await prisma.recipes.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        target: data.target,
        meal_slot: data.meal_slot ?? null,
        baby_age_group: data.baby_age_group ?? null,
        age_range_min_months: data.age_range_min_months,
        age_range_max_months: data.age_range_max_months,
        recipe_type: data.recipe_type,
        ingredients: data.ingredients ?? [],
        instructions: data.instructions ?? [],
        nutrition_info: data.nutrition_info ?? null,
        prep_time_minutes: data.prep_time_minutes ?? null,
        cooking_time_minutes: data.cooking_time_minutes ?? null,
        image_url: data.image_url ?? null,
        language: data.language ?? 'en',
      },
    });
    return row as unknown as Recipe;
  }

  async update(id: number, data: Partial<{
    title: string; description: string; target: 'baby' | 'mum';
    meal_slot: string; baby_age_group: string;
    age_range_min_months: number; age_range_max_months: number;
    recipe_type: string; ingredients: string[]; instructions: string[];
    nutrition_info: any; prep_time_minutes: number; cooking_time_minutes: number;
    image_url: string;
  }>): Promise<Recipe | null> {
    const updateData: Record<string, unknown> = { updated_at: new Date() };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.target !== undefined) updateData.target = data.target;
    if (data.meal_slot !== undefined) updateData.meal_slot = data.meal_slot;
    if (data.baby_age_group !== undefined) updateData.baby_age_group = data.baby_age_group;
    if (data.age_range_min_months !== undefined) updateData.age_range_min_months = data.age_range_min_months;
    if (data.age_range_max_months !== undefined) updateData.age_range_max_months = data.age_range_max_months;
    if (data.recipe_type !== undefined) updateData.recipe_type = data.recipe_type;
    if (data.ingredients !== undefined) updateData.ingredients = data.ingredients;
    if (data.instructions !== undefined) updateData.instructions = data.instructions;
    if (data.nutrition_info !== undefined) updateData.nutrition_info = data.nutrition_info;
    if (data.prep_time_minutes !== undefined) updateData.prep_time_minutes = data.prep_time_minutes;
    if (data.cooking_time_minutes !== undefined) updateData.cooking_time_minutes = data.cooking_time_minutes;
    if (data.image_url !== undefined) updateData.image_url = data.image_url;

    if (Object.keys(updateData).length === 1) return this.findById(id);

    const row = await prisma.recipes.update({
      where: { id },
      data: updateData,
    });
    return row as unknown as Recipe;
  }

  async delete(id: number): Promise<boolean> {
    const result = await prisma.recipes.deleteMany({ where: { id } });
    return result.count > 0;
  }
}

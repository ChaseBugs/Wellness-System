import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface CalorieRecommendation {
  id: number;
  age_min_months: number;
  age_max_months: number;
  gender: string;
  kcal_per_day: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  calcium_mg: number;
  iron_mg: number;
  label: string;
  created_at: Date | null;
}

export interface MealPlanItem {
  meal_type: string;
  title: string;
  description: string;
  total_kcal_approx: number;
  stage_label: string;
  foods: unknown[];
}

export interface WeeklyTrendDay {
  date: string;
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
}

export interface Food {
  id: number;
  name: string;
  name_ko: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
  fiber_per_100g: number;
  sodium_per_100g: number;
  calcium_per_100g: number;
  iron_per_100g: number;
  is_baby_food: boolean;
  min_age_months: number | null;
  allergens: string[];
}

export interface IntakeLog {
  id: number;
  baby_id: number | null;
  user_id: number;
  food_id: number;
  log_date: string;
  meal_type: string;
  amount_g: number;
  calories: number;
  notes?: string;
  created_at: string;
  // joined
  food_name?: string;
  food_name_ko?: string;
  food_category?: string;
}

export interface NutrientSummary {
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
  total_fiber: number;
  total_calcium: number;
  total_iron: number;
}

export interface MealBreakdown extends NutrientSummary {
  meal_type: string;
  item_count: number;
}

export class CalorieRepository {
  // ─── Food DB ────────────────────────────────────────────────────────────

  async searchFoods(search?: string, isBabyFood?: boolean, category?: string, minAgeMonths?: number) {
    const where: Prisma.foodsWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { name_ko: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (isBabyFood !== undefined) where.is_baby_food = isBabyFood;
    if (category) where.category = category;
    if (minAgeMonths !== undefined) {
      where.OR = where.OR
        ? // merge with existing search OR via AND wrapping
          undefined  // handled below
        : [{ min_age_months: null }, { min_age_months: { lte: minAgeMonths } }];

      if (search) {
        // Combine search OR with minAgeMonths condition using AND
        where.AND = [
          {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { name_ko: { contains: search, mode: 'insensitive' } },
            ],
          },
          {
            OR: [{ min_age_months: null }, { min_age_months: { lte: minAgeMonths } }],
          },
        ];
        delete where.OR;
      } else {
        where.OR = [{ min_age_months: null }, { min_age_months: { lte: minAgeMonths } }];
      }
    }

    const rows = await prisma.foods.findMany({
      where,
      orderBy: [{ is_baby_food: 'desc' }, { name: 'asc' }],
      take: 100,
    });
    return rows as unknown as Food[];
  }

  async findFoodById(id: number) {
    const row = await prisma.foods.findUnique({ where: { id } });
    return (row as unknown as Food) ?? undefined;
  }

  // ─── Intake Logs ─────────────────────────────────────────────────────────

  async getLogs(babyId: number | null, userId: number, date: string) {
    const rows = await prisma.$queryRaw<IntakeLog[]>(
      Prisma.sql`
        SELECT il.*, f.name AS food_name, f.name_ko AS food_name_ko, f.category AS food_category,
               f.calories_per_100g, f.protein_per_100g, f.fat_per_100g,
               f.carbs_per_100g, f.fiber_per_100g, f.calcium_per_100g, f.iron_per_100g
        FROM food_intake_logs il
        JOIN foods f ON f.id = il.food_id
        WHERE il.user_id = ${userId}
          AND (${babyId}::integer IS NULL OR il.baby_id = ${babyId})
          AND il.log_date = ${date}::date
        ORDER BY il.meal_type, il.created_at
      `
    );
    return rows;
  }

  async addLog(data: {
    baby_id?: number;
    user_id: number;
    food_id: number;
    log_date: string;
    meal_type: string;
    amount_g: number;
    notes?: string;
  }) {
    // Calculate calories from food table
    const food = await this.findFoodById(data.food_id);
    if (!food) throw { status: 404, message: 'Food not found.' };

    const calories = parseFloat(((data.amount_g / 100) * food.calories_per_100g).toFixed(2));

    const row = await prisma.food_intake_logs.create({
      data: {
        baby_id: data.baby_id ?? null,
        user_id: data.user_id,
        food_id: data.food_id,
        log_date: new Date(data.log_date),
        meal_type: data.meal_type,
        amount_g: new Prisma.Decimal(data.amount_g),
        calories: new Prisma.Decimal(calories),
        notes: data.notes ?? null,
      },
    });
    return row as unknown as IntakeLog;
  }

  async deleteLog(logId: number, userId: number) {
    const result = await prisma.food_intake_logs.deleteMany({
      where: { id: logId, user_id: userId },
    });
    return result.count > 0;
  }

  // ─── Daily Analysis ───────────────────────────────────────────────────────

  async getDailySummary(babyId: number | null, userId: number, date: string): Promise<NutrientSummary> {
    const rows = await prisma.$queryRaw<NutrientSummary[]>(
      Prisma.sql`
        SELECT
          COALESCE(SUM(il.amount_g / 100.0 * f.calories_per_100g), 0) AS total_calories,
          COALESCE(SUM(il.amount_g / 100.0 * f.protein_per_100g),  0) AS total_protein,
          COALESCE(SUM(il.amount_g / 100.0 * f.fat_per_100g),      0) AS total_fat,
          COALESCE(SUM(il.amount_g / 100.0 * f.carbs_per_100g),    0) AS total_carbs,
          COALESCE(SUM(il.amount_g / 100.0 * f.fiber_per_100g),    0) AS total_fiber,
          COALESCE(SUM(il.amount_g / 100.0 * f.calcium_per_100g),  0) AS total_calcium,
          COALESCE(SUM(il.amount_g / 100.0 * f.iron_per_100g),     0) AS total_iron
        FROM food_intake_logs il
        JOIN foods f ON f.id = il.food_id
        WHERE il.user_id = ${userId}
          AND (${babyId}::integer IS NULL OR il.baby_id = ${babyId})
          AND il.log_date = ${date}::date
      `
    );
    return rows[0] as NutrientSummary;
  }

  async getMealBreakdown(babyId: number | null, userId: number, date: string): Promise<MealBreakdown[]> {
    const rows = await prisma.$queryRaw<MealBreakdown[]>(
      Prisma.sql`
        SELECT
          il.meal_type,
          COUNT(*) AS item_count,
          COALESCE(SUM(il.amount_g / 100.0 * f.calories_per_100g), 0) AS total_calories,
          COALESCE(SUM(il.amount_g / 100.0 * f.protein_per_100g),  0) AS total_protein,
          COALESCE(SUM(il.amount_g / 100.0 * f.fat_per_100g),      0) AS total_fat,
          COALESCE(SUM(il.amount_g / 100.0 * f.carbs_per_100g),    0) AS total_carbs,
          COALESCE(SUM(il.amount_g / 100.0 * f.fiber_per_100g),    0) AS total_fiber,
          COALESCE(SUM(il.amount_g / 100.0 * f.calcium_per_100g),  0) AS total_calcium,
          COALESCE(SUM(il.amount_g / 100.0 * f.iron_per_100g),     0) AS total_iron
        FROM food_intake_logs il
        JOIN foods f ON f.id = il.food_id
        WHERE il.user_id = ${userId}
          AND (${babyId}::integer IS NULL OR il.baby_id = ${babyId})
          AND il.log_date = ${date}::date
        GROUP BY il.meal_type
        ORDER BY il.meal_type
      `
    );
    return rows;
  }

  // ─── Weekly Trend ─────────────────────────────────────────────────────────

  async getWeeklyTrend(babyId: number | null, userId: number, startDate: string, endDate: string): Promise<WeeklyTrendDay[]> {
    const rows = await prisma.$queryRaw<WeeklyTrendDay[]>(
      Prisma.sql`
        SELECT
          il.log_date::text AS date,
          COALESCE(SUM(il.amount_g / 100.0 * f.calories_per_100g), 0) AS total_calories,
          COALESCE(SUM(il.amount_g / 100.0 * f.protein_per_100g),  0) AS total_protein,
          COALESCE(SUM(il.amount_g / 100.0 * f.fat_per_100g),      0) AS total_fat,
          COALESCE(SUM(il.amount_g / 100.0 * f.carbs_per_100g),    0) AS total_carbs
        FROM food_intake_logs il
        JOIN foods f ON f.id = il.food_id
        WHERE il.user_id = ${userId}
          AND (${babyId}::integer IS NULL OR il.baby_id = ${babyId})
          AND il.log_date BETWEEN ${startDate}::date AND ${endDate}::date
        GROUP BY il.log_date
        ORDER BY il.log_date
      `
    );
    return rows;
  }

  // ─── Recommendation ───────────────────────────────────────────────────────

  async getRecommendation(ageMonths: number, gender: string = 'all'): Promise<CalorieRecommendation | null> {
    const rows = await prisma.$queryRaw<CalorieRecommendation[]>(
      Prisma.sql`
        SELECT * FROM calorie_recommendations
        WHERE age_min_months <= ${ageMonths} AND age_max_months >= ${ageMonths}
          AND (gender = ${gender} OR gender = 'all')
        ORDER BY CASE WHEN gender = ${gender} THEN 0 ELSE 1 END
        LIMIT 1
      `
    );
    return rows[0] ?? null;
  }

  // ─── Meal Plan Recommendations ────────────────────────────────────────────

  async getMealPlan(ageMonths: number): Promise<MealPlanItem[] | null> {
    const templates = await prisma.meal_plan_templates.findMany({
      where: {
        age_min_months: { lte: ageMonths },
        age_max_months: { gte: ageMonths },
      },
      orderBy: { sort_order: 'asc' },
    });

    if (!templates.length) return null;

    const templateIds = templates.map((t) => t.id);

    const foodRows = await prisma.$queryRaw<Array<{
      template_id: number;
      recommended_g: number;
      unit: string | null;
      serving_note: string | null;
      food_id: number;
      name: string;
      name_ko: string | null;
      category: string;
      calories_per_100g: number;
      protein_per_100g: number;
      fat_per_100g: number;
      carbs_per_100g: number;
      fiber_per_100g: number;
      calcium_per_100g: number;
      iron_per_100g: number;
      allergens: string[];
      min_age_months: number | null;
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      calcium: number;
      iron: number;
    }>>(
      Prisma.sql`
        SELECT mpf.template_id, mpf.recommended_g, mpf.unit, mpf.notes AS serving_note,
               f.id AS food_id, f.name, f.name_ko, f.category,
               f.calories_per_100g, f.protein_per_100g, f.fat_per_100g,
               f.carbs_per_100g, f.fiber_per_100g, f.calcium_per_100g, f.iron_per_100g,
               f.allergens, f.min_age_months,
               ROUND((mpf.recommended_g / 100.0 * f.calories_per_100g)::numeric, 1) AS calories,
               ROUND((mpf.recommended_g / 100.0 * f.protein_per_100g)::numeric,  1) AS protein,
               ROUND((mpf.recommended_g / 100.0 * f.fat_per_100g)::numeric,      1) AS fat,
               ROUND((mpf.recommended_g / 100.0 * f.carbs_per_100g)::numeric,    1) AS carbs,
               ROUND((mpf.recommended_g / 100.0 * f.calcium_per_100g)::numeric,  1) AS calcium,
               ROUND((mpf.recommended_g / 100.0 * f.iron_per_100g)::numeric,     3) AS iron
        FROM meal_plan_foods mpf
        JOIN foods f ON f.id = mpf.food_id
        WHERE mpf.template_id = ANY(${templateIds}::int[])
        ORDER BY mpf.id
      `
    );

    const foodsByTemplate = new Map<number, unknown[]>();
    for (const row of foodRows) {
      if (!foodsByTemplate.has(row.template_id)) foodsByTemplate.set(row.template_id, []);
      foodsByTemplate.get(row.template_id)!.push(row);
    }

    return templates.map((t): MealPlanItem => ({
      meal_type:         t.meal_type,
      title:             t.title,
      description:       t.description ?? '',
      total_kcal_approx: t.total_kcal_approx ?? 0,
      stage_label:       t.stage_label ?? '',
      foods:             foodsByTemplate.get(t.id) ?? [],
    }));
  }
}

import { CalorieRepository } from '../repositories/calorie.repository';
import { database } from '../config/database';

const repo = new CalorieRepository();

interface AnalysisResult {
  date: string;
  baby_id: number | null;
  recommendation: {
    kcal_per_day: number;
    protein_g: number;
    fat_g: number;
    carbs_g: number;
    calcium_mg: number;
    iron_mg: number;
    label: string;
  } | null;
  summary: {
    total_calories: number;
    total_protein: number;
    total_fat: number;
    total_carbs: number;
    total_fiber: number;
    total_calcium: number;
    total_iron: number;
  };
  intake_rate: {
    calories_pct: number;
    protein_pct: number;
    fat_pct: number;
    carbs_pct: number;
  };
  meal_breakdown: {
    meal_type: string;
    meal_label: string;
    total_calories: number;
    total_protein: number;
    total_fat: number;
    total_carbs: number;
    item_count: number;
  }[];
  per_food_detail: {
    id: number;
    food_id: number;
    food_name: string;
    food_name_ko: string;
    meal_type: string;
    meal_label: string;
    amount_g: number;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
    calcium: number;
    iron: number;
    calories_pct_of_day: number;
    notes?: string;
  }[];
  alerts: string[];
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  breastmilk: 'Breast Milk',
  formula: 'Formula',
};

export class CalorieService {
  // ─── Food DB ─────────────────────────────────────────────────────────────

  async searchFoods(query: {
    search?: string;
    isBabyFood?: boolean;
    category?: string;
    minAgeMonths?: number;
  }) {
    return repo.searchFoods(query.search, query.isBabyFood, query.category, query.minAgeMonths);
  }

  async getFoodDetail(foodId: number) {
    const food = await repo.findFoodById(foodId);
    if (!food) throw { status: 404, message: 'Food not found.' };
    return food;
  }

  // ─── Intake Logs ──────────────────────────────────────────────────────────

  async addIntakeLog(userId: number, data: {
    baby_id?: number;
    food_id: number;
    log_date?: string;
    meal_type: string;
    amount_g: number;
    notes?: string;
  }) {
    const log_date = data.log_date ?? new Date().toISOString().split('T')[0];
    return repo.addLog({ ...data, user_id: userId, log_date });
  }

  async getIntakeLogs(userId: number, babyId: number | null, date: string) {
    return repo.getLogs(babyId, userId, date);
  }

  async deleteIntakeLog(userId: number, logId: number) {
    const deleted = await repo.deleteLog(logId, userId);
    if (!deleted) throw { status: 404, message: 'Log not found or access denied.' };
  }

  // ─── Daily Analysis ───────────────────────────────────────────────────────

  async getDailyAnalysis(userId: number, babyId: number | null, date: string): Promise<AnalysisResult> {
    // 1. Get baby age/gender if babyId provided
    let ageMonths = 0;
    let gender = 'all';
    if (babyId) {
      const babyRow = await database.query(
        `SELECT birth_date, gender FROM babies WHERE id = $1 AND user_id = $2`,
        [babyId, userId]
      );
      const baby = babyRow.rows[0];
      if (baby) {
        const birthDate = new Date(baby.birth_date);
        const refDate = new Date(date);
        ageMonths = Math.floor((refDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
        gender = baby.gender === 'male' ? 'male' : baby.gender === 'female' ? 'female' : 'all';
      }
    }

    // 2. Get calorie recommendation
    const recommendation = babyId ? await repo.getRecommendation(ageMonths, gender) : null;

    // 3. Daily nutrition totals
    const summary = await repo.getDailySummary(babyId, userId, date);

    // 4. Breakdown by meal type
    const mealBreakdown = await repo.getMealBreakdown(babyId, userId, date);

    // 5. Per-food detail for each meal
    const logsRaw = await database.query(
      `SELECT il.id, il.food_id, il.meal_type, il.amount_g, il.notes,
              f.name AS food_name, f.name_ko AS food_name_ko,
              f.calories_per_100g, f.protein_per_100g, f.fat_per_100g,
              f.carbs_per_100g, f.fiber_per_100g, f.calcium_per_100g, f.iron_per_100g
       FROM food_intake_logs il
       JOIN foods f ON f.id = il.food_id
       WHERE il.user_id = $1
         AND ($2::integer IS NULL OR il.baby_id = $2)
         AND il.log_date = $3
       ORDER BY il.meal_type, il.created_at`,
      [userId, babyId, date]
    );

    const totalCal = Number(summary.total_calories) || 0;

    const per_food_detail = logsRaw.rows.map((r: Record<string, unknown>) => {
      const ratio = Number(r.amount_g) / 100.0;
      const cal = parseFloat((ratio * Number(r.calories_per_100g)).toFixed(2));
      return {
        id: r.id,
        food_id: r.food_id,
        food_name: r.food_name,
        food_name_ko: r.food_name_ko,
        meal_type: r.meal_type,
        meal_label: MEAL_LABELS[r.meal_type as string] ?? r.meal_type,
        amount_g: Number(r.amount_g),
        calories: cal,
        protein: parseFloat((ratio * Number(r.protein_per_100g)).toFixed(2)),
        fat:     parseFloat((ratio * Number(r.fat_per_100g)).toFixed(2)),
        carbs:   parseFloat((ratio * Number(r.carbs_per_100g)).toFixed(2)),
        fiber:   parseFloat((ratio * Number(r.fiber_per_100g)).toFixed(2)),
        calcium: parseFloat((ratio * Number(r.calcium_per_100g)).toFixed(2)),
        iron:    parseFloat((ratio * Number(r.iron_per_100g)).toFixed(5)),
        calories_pct_of_day: totalCal > 0 ? parseFloat(((cal / totalCal) * 100).toFixed(1)) : 0,
        notes: r.notes ?? undefined,
      };
    });

    // 6. Calculate intake rate
    const intake_rate = recommendation
      ? {
          calories_pct: parseFloat(((totalCal / recommendation.kcal_per_day) * 100).toFixed(1)),
          protein_pct:  parseFloat(((Number(summary.total_protein)  / recommendation.protein_g) * 100).toFixed(1)),
          fat_pct:      parseFloat(((Number(summary.total_fat)       / (recommendation.fat_g || 1))     * 100).toFixed(1)),
          carbs_pct:    parseFloat(((Number(summary.total_carbs)     / (recommendation.carbs_g || 1))   * 100).toFixed(1)),
        }
      : { calories_pct: 0, protein_pct: 0, fat_pct: 0, carbs_pct: 0 };

    // 7. Build alert messages
    const alerts: string[] = [];
    if (recommendation) {
      if (intake_rate.calories_pct < 70)
        alerts.push(`Low calorie intake (${intake_rate.calories_pct}% of recommended)`);
      else if (intake_rate.calories_pct > 130)
        alerts.push(`Excessive calorie intake (${intake_rate.calories_pct}% of recommended)`);
      if (intake_rate.protein_pct < 70)
        alerts.push(`Low protein intake (${intake_rate.protein_pct}% of recommended)`);
      if (Number(summary.total_iron) < (recommendation.iron_mg * 0.7))
        alerts.push('Low iron intake — add iron-rich foods (beef, spinach, lentils).');
      if (Number(summary.total_calcium) < (recommendation.calcium_mg * 0.7))
        alerts.push('Low calcium intake — add dairy, tofu, or broccoli.');
    }

    return {
      date,
      baby_id: babyId,
      recommendation,
      summary: {
        total_calories: parseFloat(Number(summary.total_calories).toFixed(2)),
        total_protein:  parseFloat(Number(summary.total_protein).toFixed(2)),
        total_fat:      parseFloat(Number(summary.total_fat).toFixed(2)),
        total_carbs:    parseFloat(Number(summary.total_carbs).toFixed(2)),
        total_fiber:    parseFloat(Number(summary.total_fiber).toFixed(2)),
        total_calcium:  parseFloat(Number(summary.total_calcium).toFixed(2)),
        total_iron:     parseFloat(Number(summary.total_iron).toFixed(3)),
      },
      intake_rate,
      meal_breakdown: mealBreakdown.map((m) => ({
        meal_type: m.meal_type,
        meal_label: MEAL_LABELS[m.meal_type] ?? m.meal_type,
        total_calories: parseFloat(Number(m.total_calories).toFixed(2)),
        total_protein:  parseFloat(Number(m.total_protein).toFixed(2)),
        total_fat:      parseFloat(Number(m.total_fat).toFixed(2)),
        total_carbs:    parseFloat(Number(m.total_carbs).toFixed(2)),
        item_count: Number(m.item_count),
      })),
      per_food_detail,
      alerts,
    };
  }

  // ─── Weekly Trend ─────────────────────────────────────────────────────────

  async getWeeklyTrend(userId: number, babyId: number | null, refDate?: string) {
    const end = refDate ? new Date(refDate) : new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 6);

    const startStr = start.toISOString().split('T')[0];
    const endStr   = end.toISOString().split('T')[0];

    const trend = await repo.getWeeklyTrend(babyId, userId, startStr, endStr);

    // Fill missing dates with 0
    const dateMap = new Map(trend.map((t: { date: string }) => [t.date, t]));
    const result = [];
    const cur = new Date(start);
    while (cur <= end) {
      const d = cur.toISOString().split('T')[0];
      result.push(dateMap.get(d) ?? { date: d, total_calories: 0, total_protein: 0, total_fat: 0, total_carbs: 0 });
      cur.setDate(cur.getDate() + 1);
    }
    return { start: startStr, end: endStr, days: result };
  }

  // ─── Meal Plan ────────────────────────────────────────────────────────────

  async getMealPlan(babyId: number, userId: number) {
    const babyRow = await database.query(
      `SELECT birth_date, gender, name FROM babies WHERE id = $1 AND user_id = $2`,
      [babyId, userId]
    );
    const baby = babyRow.rows[0];
    if (!baby) throw { status: 404, message: 'Baby not found.' };

    const ageMonths = Math.floor((Date.now() - new Date(baby.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    const gender    = baby.gender === 'male' ? 'male' : baby.gender === 'female' ? 'female' : 'all';

    const [mealPlan, recommendation] = await Promise.all([
      repo.getMealPlan(ageMonths),
      repo.getRecommendation(ageMonths, gender),
    ]);

    const MEAL_LABEL_MAP: Record<string, string> = {
      breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner',
      snack: 'Snack', breastmilk: 'Breast Milk', formula: 'Formula',
    };

    // Sum total daily kcal from plan
    const meals = (mealPlan ?? []).map((m: {
      meal_type: string; title: string; description: string;
      total_kcal_approx: number; stage_label: string; foods: unknown[];
    }) => ({
      ...m,
      meal_label: MEAL_LABEL_MAP[m.meal_type] ?? m.meal_type,
    }));

    const total_plan_kcal = meals.reduce((sum: number, m: { total_kcal_approx: number }) => sum + (m.total_kcal_approx ?? 0), 0);

    return {
      baby_name:    baby.name,
      age_months:   ageMonths,
      stage_label:  meals[0]?.stage_label ?? '—',
      recommendation,
      total_plan_kcal,
      meals,
    };
  }

  // ─── Recommendation ───────────────────────────────────────────────────────

  async getRecommendation(babyId: number, userId: number) {
    const babyRow = await database.query(
      `SELECT birth_date, gender FROM babies WHERE id = $1 AND user_id = $2`,
      [babyId, userId]
    );
    const baby = babyRow.rows[0];
    if (!baby) throw { status: 404, message: 'Baby not found.' };

    const ageMonths = Math.floor((Date.now() - new Date(baby.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    const gender = baby.gender === 'male' ? 'male' : baby.gender === 'female' ? 'female' : 'all';
    const rec = await repo.getRecommendation(ageMonths, gender);

    return { age_months: ageMonths, gender, recommendation: rec };
  }
}

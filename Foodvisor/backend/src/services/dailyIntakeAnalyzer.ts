import { Food } from "../models/food.js";
import { MealLog } from "../models/meal-log.js";
import { getDailyTargets, type NutrientTarget, type UserProfileForTargets } from "./dailyTargets.js";

/**
 * Per-day per-nutrient breakdown comparing logged intake against the user's WST578 targets.
 *
 * `intake` is summed across the user's MealLog rows in the date range. We try to enrich each
 * MealLog with the matching Food record (by koreanName == foodName) so vitamins/minerals are
 * captured; when no Food matches, we fall back to the macros stored on the MealLog itself.
 */
export type IntakeRow = {
  nutrientKey: string;
  nutrientLabel: string;
  unit: string;
  intake: number;
  RNI?: number;
  AI?: number;
  UL?: number;
  EER?: number;
  /** intake / preferred goal × 100 (rounded). null when no goal exists. */
  percentOfGoal: number | null;
  /** "below" if intake < EAR (or RNI when EAR missing); "in_range" when 90–110% of RNI; "above" when > RNI; "exceeds_ul" when > UL. */
  status: "below" | "in_range" | "above" | "exceeds_ul" | "no_target";
};

export type IntakeReport = {
  userName: string;
  range: { from: string; to: string };
  mealCount: number;
  totalsCalories: number;
  rows: IntakeRow[];
  warnings: string[];
};

const NUTRIENT_FIELD_MAP: Record<string, (food: any) => number> = {
  energyKcal: (f) => num(f.calories),
  protein: (f) => num(f.macros?.protein),
  fat: (f) => num(f.macros?.fat),
  carbs: (f) => num(f.macros?.carbs),
  fiber: (f) => num(f.macros?.fiber),
  saturatedFat: (f) => num(f.saturatedFat),
  cholesterol: (f) => num(f.cholesterolMg),
  addedSugar: (f) => num(f.sugar),
  sodium: (f) => num(f.minerals?.sodium),
  potassium: (f) => num(f.minerals?.potassium),
  calcium: (f) => num(f.minerals?.calcium),
  magnesium: (f) => num(f.minerals?.magnesium),
  iron: (f) => num(f.minerals?.iron),
  zinc: (f) => num(f.minerals?.zinc),
  vitaminA: (f) => num(f.vitamins?.vitaminA),
  vitaminB1: (f) => num(f.vitamins?.vitaminB1),
  vitaminB2: (f) => num(f.vitamins?.vitaminB2),
  niacin: (f) => num(f.vitamins?.vitaminB3),
  vitaminB6: (f) => num(f.vitamins?.vitaminB6),
  vitaminB12: (f) => num(f.vitamins?.vitaminB12),
  vitaminC: (f) => num(f.vitamins?.vitaminC),
  vitaminD: (f) => num(f.vitamins?.vitaminD),
  vitaminE: (f) => num(f.vitamins?.vitaminE),
  vitaminK: (f) => num(f.vitamins?.vitaminK),
  folate: (f) => num(f.vitamins?.folate)
};

function num(v: unknown) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function classify(intake: number, target: NutrientTarget): IntakeRow["status"] {
  if (typeof target.UL === "number" && intake > target.UL) return "exceeds_ul";
  const goal = target.RNI ?? target.AI ?? target.EER;
  if (typeof goal !== "number") return "no_target";
  if (typeof target.EAR === "number" && intake < target.EAR) return "below";
  if (intake < goal * 0.9) return "below";
  if (intake > goal * 1.1) return "above";
  return "in_range";
}

export type AnalyzeIntakeInput = {
  userName: string;
  from: Date;
  to: Date;
  profile: UserProfileForTargets;
};

export async function analyzeIntake(input: AnalyzeIntakeInput): Promise<IntakeReport> {
  const meals = await MealLog.find({
    userName: input.userName,
    date: { $gte: input.from, $lte: input.to }
  }).lean() as unknown as Array<{ foodName: string; calories?: number; macros?: any }>;

  const warnings: string[] = [];
  let totalsCalories = 0;
  const totals: Record<string, number> = {};

  // Pull in all Food rows referenced by name in one query for efficiency.
  const uniqueNames = Array.from(new Set(meals.map((m) => m.foodName).filter(Boolean)));
  const foods = uniqueNames.length
    ? await Food.find({ koreanName: { $in: uniqueNames } })
        .select("koreanName calories macros sugar saturatedFat cholesterolMg vitamins minerals")
        .lean() as unknown as Array<Record<string, unknown>>
    : [];
  const foodByName = new Map<string, Record<string, unknown>>();
  for (const f of foods) foodByName.set(String(f.koreanName), f);

  let unmatched = 0;
  for (const meal of meals) {
    totalsCalories += num(meal.calories);
    const food = foodByName.get(meal.foodName);
    if (!food) {
      unmatched++;
      // Fall back to macros stored on the MealLog itself (per-100g semantics; here we treat the log as one serving).
      totals.protein = (totals.protein ?? 0) + num(meal.macros?.protein);
      totals.fat = (totals.fat ?? 0) + num(meal.macros?.fat);
      totals.carbs = (totals.carbs ?? 0) + num(meal.macros?.carbs);
      totals.fiber = (totals.fiber ?? 0) + num(meal.macros?.fiber);
      totals.energyKcal = (totals.energyKcal ?? 0) + num(meal.calories);
      continue;
    }
    for (const [nutrientKey, getter] of Object.entries(NUTRIENT_FIELD_MAP)) {
      totals[nutrientKey] = (totals[nutrientKey] ?? 0) + getter(food);
    }
  }

  if (unmatched) {
    warnings.push(`${unmatched} of ${meals.length} meal logs had no matching Food record (matched by koreanName == foodName); macros were used from the log itself, vitamins/minerals are missing for those entries.`);
  }

  const targets = await getDailyTargets(input.profile);
  const targetByKey = new Map(targets.map((t) => [t.nutrientKey, t]));

  const rows: IntakeRow[] = [];
  // One row per nutrient that either has intake OR a target — gives the user a complete picture.
  const nutrientKeys = new Set([...Object.keys(totals), ...targets.map((t) => t.nutrientKey)]);
  for (const key of nutrientKeys) {
    const intake = num(totals[key]);
    const target = targetByKey.get(key);
    const goal = target ? (target.RNI ?? target.AI ?? target.EER) : undefined;
    rows.push({
      nutrientKey: key,
      nutrientLabel: target?.nutrientLabel ?? key,
      unit: target?.unit ?? "",
      intake: Number(intake.toFixed(2)),
      RNI: target?.RNI,
      AI: target?.AI,
      UL: target?.UL,
      EER: target?.EER,
      percentOfGoal: typeof goal === "number" && goal > 0
        ? Math.round((intake / goal) * 100)
        : null,
      status: target ? classify(intake, target) : "no_target"
    });
  }

  rows.sort((a, b) => a.nutrientKey.localeCompare(b.nutrientKey));

  return {
    userName: input.userName,
    range: { from: input.from.toISOString(), to: input.to.toISOString() },
    mealCount: meals.length,
    totalsCalories: Number(totalsCalories.toFixed(1)),
    rows,
    warnings
  };
}

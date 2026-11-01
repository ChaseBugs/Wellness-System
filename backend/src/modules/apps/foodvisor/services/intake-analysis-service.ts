import { ValidationError } from "../../../../utils/errors.js";
import type { NutrientTarget, UserProfileForTargets } from "../calculators/daily-targets.js";
import type { IMealLogRepository } from "../domain/IMealLogRepository.js";
import type { IntakeReportResponse, IntakeRow, LoggedItemForAnalysis } from "../models/intake-analysis.js";
import type { DailyTargetService } from "./daily-target-service.js";

type FoodNutrients = NonNullable<LoggedItemForAnalysis["food"]>;

const num = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

// DRI nutrient keys -> value per 100 g of the logged food.
const NUTRIENT_FIELD_MAP: Record<string, (food: FoodNutrients) => number> = {
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

function classify(intake: number, target: NutrientTarget): IntakeRow["status"] {
  if (typeof target.UL === "number" && intake > target.UL) return "exceeds_ul";
  const goal = target.RNI ?? target.AI ?? target.EER;
  if (typeof goal !== "number") return "no_target";
  if (typeof target.EAR === "number" && intake < target.EAR) return "below";
  if (intake < goal * 0.9) return "below";
  if (intake > goal * 1.1) return "above";
  return "in_range";
}

/**
 * Compares logged intake against WS/T 578 targets, nutrient by nutrient. Items linked to a food use its
 * full vitamin/mineral profile scaled by quantity; manual and recipe items contribute their macros only.
 */
export class IntakeAnalysisService {
  constructor(
    private mealLogRepository: IMealLogRepository,
    private dailyTargetService: DailyTargetService
  ) {}

  async analyze(userId: string, from: string, to: string, profileOverride?: UserProfileForTargets): Promise<IntakeReportResponse> {
    if (Date.parse(from) >= Date.parse(to)) throw new ValidationError("`from` must be before `to`");

    const [items, profile] = await Promise.all([
      this.mealLogRepository.itemsForAnalysis(userId, from, to),
      profileOverride ? Promise.resolve(profileOverride) : this.dailyTargetService.profileFor(userId)
    ]);

    const totals: Record<string, number> = {};
    const add = (key: string, value: number) => (totals[key] = (totals[key] ?? 0) + value);
    let macroOnly = 0;
    for (const item of items) {
      if (item.food) {
        const factor = item.quantityG ? num(item.quantityG) / 100 : 1;
        for (const [key, getter] of Object.entries(NUTRIENT_FIELD_MAP)) add(key, getter(item.food) * factor);
      } else {
        macroOnly++;
        add("energyKcal", num(item.calories));
        add("protein", num(item.proteinG));
        add("carbs", num(item.carbsG));
        add("fat", num(item.fatG));
      }
    }

    const warnings: string[] = [];
    if (macroOnly) {
      warnings.push(`${macroOnly} of ${items.length} logged items are not linked to a food record; only their calories and macros are counted.`);
    }

    const targets = await this.dailyTargetService.targets(profile);
    const targetByKey = new Map(targets.map((target) => [target.nutrientKey, target]));
    const rows: IntakeRow[] = [...new Set([...Object.keys(totals), ...targets.map((target) => target.nutrientKey)])]
      .map((key) => {
        const intake = num(totals[key]);
        const target = targetByKey.get(key);
        const goal = target ? target.RNI ?? target.AI ?? target.EER : undefined;
        return {
          nutrientKey: key,
          nutrientLabel: target?.nutrientLabel ?? key,
          unit: target?.unit ?? "",
          intake: Number(intake.toFixed(2)),
          RNI: target?.RNI,
          AI: target?.AI,
          UL: target?.UL,
          EER: target?.EER,
          percentOfGoal: typeof goal === "number" && goal > 0 ? Math.round((intake / goal) * 100) : null,
          status: target ? classify(intake, target) : ("no_target" as const)
        };
      })
      .sort((a, b) => a.nutrientKey.localeCompare(b.nutrientKey));

    return {
      range: { from, to },
      itemCount: items.length,
      totalCalories: Number(num(totals.energyKcal).toFixed(1)),
      rows,
      warnings
    };
  }
}

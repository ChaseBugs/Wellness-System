import type { AppCode } from "../../../../config/app-catalog.js";
import { ValidationError } from "../../../../utils/errors.js";
import type { ActivitySummaryReader, ConsentChecker } from "../domain/foodvisor-ports.js";
import type { IMealLogRepository } from "../domain/IMealLogRepository.js";
import type { INutritionGoalRepository } from "../domain/INutritionGoalRepository.js";
import type { DailySummaryResponse } from "../models/daily-summary.js";
import { toNutritionGoalResponse } from "./nutrition-goal-service.js";

// Routine apps whose activity Foodvisor may show, each only after its own explicit consent.
const ACTIVITY_SOURCES: AppCode[] = ["daily-workout", "daily-yoga"];

function isValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

export class DailySummaryService {
  constructor(
    private mealLogRepository: IMealLogRepository,
    private nutritionGoalRepository: INutritionGoalRepository,
    private consentChecker: ConsentChecker,
    private activityReader: ActivitySummaryReader
  ) {}

  async get(userId: string, date: string, timezone: string): Promise<DailySummaryResponse> {
    if (!isValidTimezone(timezone)) throw new ValidationError(`Unknown timezone: ${timezone}`);

    const [totals, goal] = await Promise.all([
      this.mealLogRepository.dayTotals(userId, date, timezone),
      this.nutritionGoalRepository.findByUser(userId)
    ]);

    const connectedActivity: DailySummaryResponse["connectedActivity"] = [];
    for (const appCode of ACTIVITY_SOURCES) {
      if (!(await this.consentChecker.hasConsent(userId, appCode, "foodvisor", "activity_summary"))) continue;
      const day = await this.activityReader.summarizeDay(userId, [appCode], date);
      connectedActivity.push({ appCode, sessions: day.sessions, minutes: day.minutes });
    }

    const { mealsLogged, ...macros } = totals;
    return {
      date,
      timezone,
      mealsLogged,
      totals: macros,
      goal: goal ? toNutritionGoalResponse(goal) : null,
      remainingCalories: goal ? Math.round(goal.calories - macros.calories) : null,
      connectedActivity
    };
  }
}

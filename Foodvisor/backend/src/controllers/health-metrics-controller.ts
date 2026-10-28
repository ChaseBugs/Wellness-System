import type { NextFunction, Request, Response } from "express";
import { calculateHealthMetrics, type HealthMetricsInput } from "../services/healthMetrics.js";
import { sendSuccess } from "../utils/response.js";

export class HealthMetricsController {
  calculate = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const input = req.body as HealthMetricsInput;
      const result = calculateHealthMetrics({
        gender: input.gender,
        age: Number(input.age),
        heightCm: Number(input.heightCm),
        weightKg: Number(input.weightKg),
        activityLevel: input.activityLevel,
        goal: input.goal,
        dailyActivityCalories: input.dailyActivityCalories,
        calorieAdjustment: input.calorieAdjustment,
        macroRatios: input.macroRatios,
        activities: input.activities
      });

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };
}

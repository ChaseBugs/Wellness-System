import { calculateHealthMetrics, type HealthMetricsInput } from "../calculators/health-metrics.js";

/** BMI, BMR, TDEE, calorie/macro goals and child growth screening (wellness estimates, not diagnosis). */
export class HealthMetricsService {
  calculate(input: HealthMetricsInput): ReturnType<typeof calculateHealthMetrics> {
    return calculateHealthMetrics(input);
  }
}

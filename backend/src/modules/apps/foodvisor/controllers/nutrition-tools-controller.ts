import type { HealthMetricsInput } from "../calculators/health-metrics.js";
import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { DailyTargetsRequest } from "../models/daily-target.js";
import type { OptimizeDietInput } from "../models/diet-optimizer.js";
import { toTargetProfile, type DailyTargetService } from "../services/daily-target-service.js";
import type { DietOptimizerService } from "../services/diet-optimizer-service.js";
import type { HealthMetricsService } from "../services/health-metrics-service.js";
import type { IntakeAnalysisService } from "../services/intake-analysis-service.js";

function targetRequest(source: Record<string, unknown>): DailyTargetsRequest {
  const text = (value: unknown) => (typeof value === "string" && value.length > 0 ? value : undefined);
  return {
    age: Number(source.age),
    gender: text(source.gender),
    lifeStage: text(source.lifeStage),
    populationGroup: text(source.populationGroup),
    // The legacy app sent `pal`; both names are accepted.
    physicalActivityLevel: text(source.physicalActivityLevel) ?? text(source.pal)
  };
}

/** Foodvisor's calculators: body metrics, WS/T 578 daily targets, LP diet optimizer, intake analysis. */
export class NutritionToolsController extends BaseController {
  constructor(
    private healthMetricsService: HealthMetricsService,
    private dailyTargetService: DailyTargetService,
    private dietOptimizerService: DietOptimizerService,
    private intakeAnalysisService: IntakeAnalysisService
  ) {
    super();
  }

  healthMetrics = this.handle(async (req, res) => {
    const body = req.body as HealthMetricsInput;
    sendSuccess(
      res,
      this.healthMetricsService.calculate({
        gender: body.gender,
        age: Number(body.age),
        heightCm: Number(body.heightCm),
        weightKg: Number(body.weightKg),
        activityLevel: body.activityLevel,
        goal: body.goal,
        dailyActivityCalories: body.dailyActivityCalories,
        calorieAdjustment: body.calorieAdjustment,
        macroRatios: body.macroRatios,
        activities: body.activities
      })
    );
  });

  dailyTargetsFromQuery = this.handle(async (req, res) => {
    sendSuccess(res, await this.dailyTargetService.resolveForRequest(targetRequest(req.query as Record<string, unknown>)));
  });

  dailyTargetsFromBody = this.handle(async (req, res) => {
    sendSuccess(res, await this.dailyTargetService.resolveForRequest(targetRequest(req.body as Record<string, unknown>)));
  });

  myDailyTargets = this.handle(async (req, res) => {
    sendSuccess(res, await this.dailyTargetService.resolveForUser(this.userId(req)));
  });

  optimizeDiet = this.handle(async (req, res) => {
    const body = req.body as OptimizeDietInput;
    sendSuccess(
      res,
      await this.dietOptimizerService.optimize({
        profileKey: body.profileKey,
        targetProfile: body.targetProfile ? toTargetProfile(targetRequest(body.targetProfile as Record<string, unknown>)) : undefined,
        dataSource: body.dataSource,
        candidateLimit: body.candidateLimit,
        poolLimit: body.poolLimit,
        maxServingsPerFood: body.maxServingsPerFood,
        topPerNutrient: body.topPerNutrient,
        includeCategories: body.includeCategories,
        excludeCategories: body.excludeCategories,
        excludeTerms: body.excludeTerms,
        constraints: body.constraints
      })
    );
  });

  analyzeIntake = this.handle(async (req, res) => {
    const startOfToday = new Date(new Date().toISOString().slice(0, 10)).toISOString();
    const from = this.query(req, "from") ?? startOfToday;
    const to = this.query(req, "to") ?? new Date(Date.parse(from) + 86_400_000).toISOString();
    // Without age in the query, targets come from the user's Foodvisor profile.
    const override = this.query(req, "age") ? toTargetProfile(targetRequest(req.query as Record<string, unknown>)) : undefined;
    sendSuccess(res, await this.intakeAnalysisService.analyze(this.userId(req), from, to, override));
  });
}

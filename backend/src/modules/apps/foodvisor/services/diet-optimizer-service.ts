import { ValidationError } from "../../../../utils/errors.js";
import logger, { EMOJIS } from "../../../../utils/logger.js";
import {
  chooseCandidates,
  constraintsFromTargets,
  excludeByTerms,
  normalizeConstraint,
  solveDiet,
  type OptimizerConstraint,
  type OptimizerFood
} from "../calculators/diet-optimizer.js";
import type { IFoodRepository } from "../domain/IFoodRepository.js";
import type { INutritionReferenceRepository } from "../domain/INutritionReferenceRepository.js";
import type { Food } from "../models/food.js";
import type { OptimizeDietInput, OptimizeDietResponse } from "../models/diet-optimizer.js";
import type { DailyTargetService } from "./daily-target-service.js";

const DEFAULT_PROFILE_KEY = "lp-diet-sr28-adult";

function toOptimizerFood(food: Food): OptimizerFood {
  return {
    id: food.id,
    koreanName: food.koreanName,
    category: food.category,
    sourceFoodId: food.sourceFoodId,
    dataSource: food.dataSource,
    calories: Number(food.calories),
    macros: food.macros ?? {},
    sugar: Number(food.sugar),
    saturatedFat: Number(food.saturatedFat),
    cholesterolMg: Number(food.cholesterolMg),
    vitamins: food.vitamins ?? {},
    minerals: food.minerals ?? {},
    sourceNutrition: food.sourceNutrition ?? {}
  };
}

/** Cheapest-in-calories food combination that meets the nutrient bounds (linear programming). */
export class DietOptimizerService {
  constructor(
    private foodRepository: IFoodRepository,
    private referenceRepository: INutritionReferenceRepository,
    private dailyTargetService: DailyTargetService
  ) {}

  async optimize(input: OptimizeDietInput): Promise<OptimizeDietResponse> {
    const { constraints, source } = await this.loadConstraints(input);
    if (constraints.length === 0) {
      throw new ValidationError("No nutrition constraints found: pass constraints, a targetProfile, or a profileKey with nutrition_constraints rows");
    }

    const dataSource = input.dataSource && input.dataSource.toLowerCase() !== "all" ? input.dataSource : undefined;
    const pool = excludeByTerms(
      (
        await this.foodRepository.optimizerPool({
          dataSource,
          includeCategories: input.includeCategories?.map((category) => category.toLowerCase()),
          excludeCategories: input.excludeCategories?.map((category) => category.toLowerCase()),
          limit: Math.min(Math.max(input.poolLimit || 30000, 100), 50000)
        })
      ).map(toOptimizerFood),
      input.excludeTerms
    );
    if (pool.length === 0) throw new ValidationError("No foods match the dataSource/category filters");

    const candidates = chooseCandidates(pool, constraints, input);
    const maxServingsPerFood = Math.min(Math.max(input.maxServingsPerFood || 10, 0.25), 50);
    const solution = solveDiet(candidates, constraints, maxServingsPerFood);
    logger.infoWithEmoji(solution.feasible ? EMOJIS.SUCCESS : EMOJIS.WARN, `Diet optimization ${solution.feasible ? "feasible" : "infeasible"}`, "FOODVISOR", {
      candidateCount: candidates.length,
      constraintCount: constraints.length
    });

    return {
      ...solution,
      ...(solution.feasible ? { objective: "minimize energyKcal while satisfying nutrition constraints" } : {}),
      dataSource: dataSource ?? "all foods",
      profileKey: input.profileKey || DEFAULT_PROFILE_KEY,
      constraintSource: source,
      poolCount: pool.length,
      maxServingsPerFood
    };
  }

  private async loadConstraints(input: OptimizeDietInput): Promise<{ constraints: OptimizerConstraint[]; source: OptimizeDietResponse["constraintSource"] }> {
    if (input.constraints?.length) return { constraints: input.constraints.map(normalizeConstraint), source: "request" };
    if (input.targetProfile) {
      const derived = constraintsFromTargets(await this.dailyTargetService.targets(input.targetProfile));
      if (derived.length) return { constraints: derived, source: "daily_targets" };
    }
    const stored = await this.referenceRepository.constraintsForProfile(input.profileKey || DEFAULT_PROFILE_KEY);
    return { constraints: stored.map(normalizeConstraint), source: "nutrition_constraints" };
  }
}

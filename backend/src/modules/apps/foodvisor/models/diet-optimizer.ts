import type { UserProfileForTargets } from "../calculators/daily-targets.js";
import type { DietSolution, OptimizerConstraint } from "../calculators/diet-optimizer.js";

export interface OptimizeDietInput {
  /** nutrition_constraints.profile_key used when no explicit constraints or targetProfile are given. */
  profileKey?: string;
  /** Derive constraints from WS/T 578 daily targets for this profile. */
  targetProfile?: UserProfileForTargets;
  dataSource?: string;
  candidateLimit?: number;
  poolLimit?: number;
  maxServingsPerFood?: number;
  topPerNutrient?: number;
  includeCategories?: string[];
  excludeCategories?: string[];
  excludeTerms?: string[];
  constraints?: Array<Partial<OptimizerConstraint> & { nutrientKey: string }>;
}

export type OptimizeDietResponse = DietSolution & {
  objective?: string;
  dataSource: string;
  profileKey: string;
  constraintSource: "request" | "daily_targets" | "nutrition_constraints";
  poolCount: number;
  maxServingsPerFood: number;
};

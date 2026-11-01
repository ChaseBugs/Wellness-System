import type { IntakeRuleRow } from "../calculators/daily-targets.js";
import type { OptimizerConstraint } from "../calculators/diet-optimizer.js";

/** Read access to the WS/T 578 intake rules and the optimizer's constraint profiles. */
export interface INutritionReferenceRepository {
  intakeRulesForGenders(genders: string[]): Promise<IntakeRuleRow[]>;
  constraintsForProfile(profileKey: string): Promise<OptimizerConstraint[]>;
}

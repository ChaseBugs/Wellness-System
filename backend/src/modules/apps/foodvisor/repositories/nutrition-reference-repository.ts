import type pg from "pg";
import { camelizeRows } from "../../../../utils/sql.js";
import type { IntakeRuleRow } from "../calculators/daily-targets.js";
import type { OptimizerConstraint } from "../calculators/diet-optimizer.js";
import type { INutritionReferenceRepository } from "../domain/INutritionReferenceRepository.js";

export class NutritionReferenceRepository implements INutritionReferenceRepository {
  constructor(private pool: pg.Pool) {}

  async intakeRulesForGenders(genders: string[]): Promise<IntakeRuleRow[]> {
    const result = await this.pool.query(
      `SELECT rule_key, nutrient_key, nutrient_label, reference_type, unit, value, value_min, value_max, age_min, age_max,
              gender, life_stage, population_group, physical_activity_level
       FROM foodvisor.nutrient_intake_rules WHERE gender = ANY($1::text[])`,
      [genders]
    );
    return camelizeRows<IntakeRuleRow>(result.rows);
  }

  async constraintsForProfile(profileKey: string): Promise<OptimizerConstraint[]> {
    const result = await this.pool.query(
      `SELECT nutrient_key, nutrient_label, coalesce(unit, '') AS unit, lower_bound, upper_bound, is_percent_of_calories,
              calories_per_gram
       FROM foodvisor.nutrition_constraints WHERE profile_key = $1 ORDER BY nutrient_key`,
      [profileKey]
    );
    return camelizeRows<OptimizerConstraint>(result.rows);
  }
}

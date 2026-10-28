import { NutrientIntakeRule } from "../models/nutrient-intake-rule.js";

/** A normalized user-facing dietary target for one nutrient. */
export type NutrientTarget = {
  nutrientKey: string;
  nutrientLabel: string;
  unit: string;
  goalType?: "RNI" | "AI" | "EER" | "EAR";
  /** Estimated Average Requirement (50% of population) — when present. */
  EAR?: number;
  /** Recommended Nutrient Intake (~98% of population) — preferred personal goal. */
  RNI?: number;
  /** Adequate Intake — used when RNI/EAR can't be set. */
  AI?: number;
  /** Tolerable Upper Intake Level — ceiling. */
  UL?: number;
  /** Estimated Energy Requirement (only meaningful for energy). */
  EER?: number;
  /** Acceptable Macronutrient Distribution Range, usually as % energy. */
  AMDR?: { value?: number; min?: number; max?: number; unit: string };
  /** Per-reference units; needed when AMDR is %E but EAR/RNI is g/d. */
  units?: Partial<Record<"EAR" | "RNI" | "AI" | "UL" | "EER" | "AMDR", string>>;
  /** Source rule keys so the admin can trace back to WST578 rows. */
  sourceRuleKeys: string[];
};

export type UserProfileForTargets = {
  /** Years (decimal allowed). Required for adults; for children <1, pass <1. */
  age: number;
  /** Schema accepts non_binary; for DRI matching we coerce to "all" plus optional explicit gender preference. */
  gender: "male" | "female" | "all";
  /** "general", "pregnancy_early", "pregnancy_mid", "pregnancy_late", "lactation". */
  lifeStage?: string;
  /** "general", "pregnant", "lactating", "infant", "child", "adolescent", "adult", "elderly". */
  populationGroup?: string;
  /** "rest", "light", "moderate", "heavy" — used only for energy (EER). */
  physicalActivityLevel?: string;
};

export type DailyTargetWarning = {
  code: string;
  message: string;
};

export type DailyTargetResolution = {
  requestedProfile: UserProfileForTargets;
  profile: UserProfileForTargets;
  warnings: DailyTargetWarning[];
  targets: NutrientTarget[];
};

type RuleRow = {
  ruleKey: string;
  nutrientKey: string;
  nutrientLabel?: string;
  referenceType: string;
  unit: string;
  value?: number;
  valueMin?: number;
  valueMax?: number;
  ageMin?: number;
  ageMax?: number;
  gender?: string;
  lifeStage?: string;
  populationGroup?: string;
  physicalActivityLevel?: string;
};

function ageMatches(rule: RuleRow, age: number) {
  if (typeof rule.ageMin === "number" && age < rule.ageMin) return false;
  if (typeof rule.ageMax === "number" && rule.ageMax !== null && age >= rule.ageMax) return false;
  return true;
}

function inferPopulationGroup(age: number): string {
  if (age < 1) return "infant";
  if (age < 11) return "child";
  if (age < 18) return "adolescent";
  if (age >= 65) return "senior";
  return "adult";
}

function normalizeLifeStage(raw?: string): string {
  if (!raw || raw === "general") return "general";
  if (raw === "pregnant") return "pregnancy";
  if (raw === "lactating") return "lactation";
  return raw;
}

function populationForLifeStage(lifeStage: string): string | null {
  if (lifeStage.startsWith("pregnancy")) return "pregnant";
  if (lifeStage === "lactation") return "lactating";
  return null;
}

function isSpecialLifeStage(stage?: string) {
  return Boolean(stage && (stage.startsWith("pregnancy") || stage === "lactation"));
}

function isSpecialRule(rule: RuleRow) {
  return rule.populationGroup === "pregnant" || rule.populationGroup === "lactating" || isSpecialLifeStage(rule.lifeStage);
}

export function normalizeDailyTargetProfile(input: UserProfileForTargets): { profile: UserProfileForTargets; warnings: DailyTargetWarning[] } {
  const warnings: DailyTargetWarning[] = [];
  const inferredPopulation = inferPopulationGroup(input.age);
  let gender = input.gender;
  let lifeStage = normalizeLifeStage(input.lifeStage);
  let populationGroup = input.populationGroup || inferredPopulation;
  let physicalActivityLevel = input.physicalActivityLevel;

  const lifeStagePopulation = populationForLifeStage(lifeStage);
  if (lifeStagePopulation) {
    if (gender !== "female") {
      warnings.push({
        code: "life_stage_gender_adjusted",
        message: "Pregnancy/lactation targets require female gender; gender was adjusted to female."
      });
      gender = "female";
    }
    if (populationGroup !== lifeStagePopulation) {
      warnings.push({
        code: "life_stage_population_adjusted",
        message: `Population group was adjusted to ${lifeStagePopulation} for the selected life stage.`
      });
      populationGroup = lifeStagePopulation;
    }
  } else if (populationGroup !== inferredPopulation) {
    warnings.push({
      code: "age_population_adjusted",
      message: `Population group was adjusted from ${populationGroup} to ${inferredPopulation} based on age ${input.age}.`
    });
    populationGroup = inferredPopulation;
  }

  if (physicalActivityLevel === "rest") {
    warnings.push({
      code: "pal_adjusted",
      message: "WST578 energy rows use light/moderate/heavy activity; rest was adjusted to light."
    });
    physicalActivityLevel = "light";
  }

  return {
    profile: {
      age: input.age,
      gender,
      lifeStage,
      populationGroup,
      physicalActivityLevel
    },
    warnings
  };
}

/** Score how specific a candidate rule is for the given profile. Higher = better match. */
function specificityScore(rule: RuleRow, profile: UserProfileForTargets): number {
  let score = 0;

  // Exact gender match preferred over "all".
  if (rule.gender === profile.gender) score += 4;
  else if (rule.gender === "all") score += 1;
  else return -Infinity;   // wrong gender; reject

  // Tighter age bracket beats loose one.
  if (typeof rule.ageMin === "number" && typeof rule.ageMax === "number") {
    score += 3;
    score -= (rule.ageMax - rule.ageMin) * 0.05;
  } else if (typeof rule.ageMin === "number") {
    score += 1;
  }

  // Life stage match.
  const ls = profile.lifeStage ?? "general";
  if (rule.lifeStage === ls) score += 3;
  else if (ls === "pregnancy" && rule.lifeStage?.startsWith("pregnancy")) score += 2.5;
  else if (ls.startsWith("pregnancy") && rule.lifeStage === "pregnancy") score += 2;
  else if (rule.lifeStage === "general" || !rule.lifeStage) score += 1;
  else return -Infinity;   // wrong life stage; reject

  // Population group match. Pregnancy/lactation can inherit the age-based base rows,
  // while incompatible child/adult/senior groups must not leak into the result.
  const pg = profile.populationGroup ?? "general";
  const agePopulation = inferPopulationGroup(profile.age);
  const specialPopulation = pg === "pregnant" || pg === "lactating";
  if (rule.populationGroup === pg) score += 2;
  else if (specialPopulation && rule.populationGroup === agePopulation) score += 1.25;
  else if (rule.populationGroup === "general" || !rule.populationGroup) score += 0.5;
  else return -Infinity;

  // Prefer the closest lower age boundary when source rows are open-ended ("11～", "18～", etc.).
  if (!isSpecialRule(rule) && typeof rule.ageMin === "number") {
    score += Math.min(rule.ageMin, profile.age) * 0.02;
  }

  // Activity level: only matters when both rule and profile specify it (mostly EER).
  if (rule.physicalActivityLevel && profile.physicalActivityLevel) {
    if (rule.physicalActivityLevel === profile.physicalActivityLevel) score += 2;
    else return -Infinity;   // explicit mismatch
  } else if (rule.physicalActivityLevel && !profile.physicalActivityLevel) {
    score -= 0.5;
  }

  return score;
}

function pickValue(rule: RuleRow): number | undefined {
  if (typeof rule.value === "number") return rule.value;
  if (typeof rule.valueMin === "number" && typeof rule.valueMax === "number") {
    return (rule.valueMin + rule.valueMax) / 2;
  }
  if (typeof rule.valueMax === "number") return rule.valueMax;
  if (typeof rule.valueMin === "number") return rule.valueMin;
  return undefined;
}

function pickGoalType(target: NutrientTarget): NutrientTarget["goalType"] | undefined {
  if (typeof target.RNI === "number") return "RNI";
  if (typeof target.AI === "number") return "AI";
  if (typeof target.EER === "number") return "EER";
  if (typeof target.EAR === "number") return "EAR";
  return undefined;
}

/**
 * Resolve a user's per-nutrient daily targets from the WST578 NutrientIntakeRule
 * collection, picking the most specific rule available for each (nutrient × referenceType).
 *
 * Strategy:
 *   1. Pre-filter Mongo by gender (∈ {profile.gender, "all"}) and an age window.
 *   2. For every (nutrientKey, referenceType) bucket, score candidates by specificity
 *      (gender > lifeStage > populationGroup > tighter age bracket > activity match).
 *   3. Keep the top-scored row per bucket; resolve to a numeric `value`.
 *   4. Group by nutrientKey, surface RNI / EAR / AI / UL / EER together.
 */
async function computeDailyTargets(profile: UserProfileForTargets): Promise<NutrientTarget[]> {
  const genderQuery = profile.gender === "all"
    ? ["all"]
    : [profile.gender, "all"];

  const candidates = await NutrientIntakeRule.find({
    gender: { $in: genderQuery }
  }).lean() as unknown as RuleRow[];

  // Bucket by (nutrientKey, referenceType) and pick the best-scored rule per bucket.
  type Bucket = { rule: RuleRow; score: number };
  const buckets = new Map<string, Bucket>();

  for (const rule of candidates) {
    if (!isSpecialRule(rule) && !ageMatches(rule, profile.age)) continue;
    const score = specificityScore(rule, profile);
    if (score === -Infinity) continue;

    const key = `${rule.nutrientKey}::${rule.referenceType}`;
    const current = buckets.get(key);
    if (!current || score > current.score) {
      buckets.set(key, { rule, score });
    }
  }

  // Group by nutrient.
  type Acc = NutrientTarget & { _refTypes: Set<string>; _units: Map<string, string> };
  const byNutrient = new Map<string, Acc>();

  for (const { rule } of buckets.values()) {
    const value = pickValue(rule);
    if (value === undefined) continue;

    let acc = byNutrient.get(rule.nutrientKey);
    if (!acc) {
      acc = {
        nutrientKey: rule.nutrientKey,
        nutrientLabel: rule.nutrientLabel || rule.nutrientKey,
        unit: rule.unit,
        sourceRuleKeys: [],
        _refTypes: new Set(),
        _units: new Map()
      };
      byNutrient.set(rule.nutrientKey, acc);
    }

    const refType = rule.referenceType.toUpperCase();
    if (!acc._refTypes.has(refType)) {
      acc._refTypes.add(refType);
      acc.sourceRuleKeys.push(rule.ruleKey);
      acc._units.set(refType, rule.unit);
      switch (refType) {
        case "RNI": acc.RNI = value; break;
        case "AI":  acc.AI = value; break;
        case "EAR": acc.EAR = value; break;
        case "UL":  acc.UL = value; break;
        case "EER": acc.EER = value; break;
        case "AMDR": acc.AMDR = { value: rule.value, min: rule.valueMin, max: rule.valueMax, unit: rule.unit }; break;
        // AMDR / PI / SPL are skipped — surfaced via ranges only when the caller asks for them.
      }
    }
  }

  return [...byNutrient.values()]
    .map(({ _refTypes, _units, ...rest }) => {
      const goalType = pickGoalType(rest);
      const units = Object.fromEntries(_units.entries()) as NutrientTarget["units"];
      return {
        ...rest,
        goalType,
        unit: (goalType ? units?.[goalType] : undefined) ?? rest.unit,
        units
      };
    })
    .sort((a, b) => a.nutrientKey.localeCompare(b.nutrientKey));
}

export async function resolveDailyTargets(profile: UserProfileForTargets): Promise<DailyTargetResolution> {
  const normalized = normalizeDailyTargetProfile(profile);
  const targets = await computeDailyTargets(normalized.profile);
  return {
    requestedProfile: profile,
    profile: normalized.profile,
    warnings: normalized.warnings,
    targets
  };
}

export async function getDailyTargets(profile: UserProfileForTargets): Promise<NutrientTarget[]> {
  return (await resolveDailyTargets(profile)).targets;
}

/**
 * Convenience: collapse to a single "personal goal" per nutrient.
 * RNI > AI > EER (for energy) > undefined.
 */
export function preferredGoal(target: NutrientTarget): number | undefined {
  if (typeof target.RNI === "number") return target.RNI;
  if (typeof target.AI === "number") return target.AI;
  if (typeof target.EER === "number") return target.EER;
  if (typeof target.EAR === "number") return target.EAR;
  return undefined;
}

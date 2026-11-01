/**
 * WS/T 578 daily-target matching, moved from the legacy Foodvisor backend (services/dailyTargets.ts).
 * Pure functions: the caller loads candidate NutrientIntakeRule rows, this file picks the most specific
 * rule per (nutrient x reference type) for a profile.
 */

/** A normalized user-facing dietary target for one nutrient. */
export type NutrientTarget = {
  nutrientKey: string;
  nutrientLabel: string;
  unit: string;
  goalType?: "RNI" | "AI" | "EER" | "EAR";
  /** Estimated Average Requirement (50% of population). */
  EAR?: number;
  /** Recommended Nutrient Intake (~98% of population): the preferred personal goal. */
  RNI?: number;
  /** Adequate Intake: used when RNI/EAR can't be set. */
  AI?: number;
  /** Tolerable Upper Intake Level: ceiling. */
  UL?: number;
  /** Estimated Energy Requirement (only meaningful for energy). */
  EER?: number;
  /** Acceptable Macronutrient Distribution Range, usually as % energy. */
  AMDR?: { value?: number; min?: number; max?: number; unit: string };
  /** Per-reference units; needed when AMDR is %E but EAR/RNI is g/d. */
  units?: Partial<Record<"EAR" | "RNI" | "AI" | "UL" | "EER" | "AMDR", string>>;
  /** Source rule keys so the admin can trace back to WS/T 578 rows. */
  sourceRuleKeys: string[];
};

export type UserProfileForTargets = {
  /** Years (decimal allowed). */
  age: number;
  gender: "male" | "female" | "all";
  /** "general", "pregnancy_early", "pregnancy_mid", "pregnancy_late", "lactation". */
  lifeStage?: string;
  /** "general", "pregnant", "lactating", "infant", "child", "adolescent", "adult", "senior". */
  populationGroup?: string;
  /** "rest", "light", "moderate", "heavy": used only for energy (EER). */
  physicalActivityLevel?: string;
};

export type DailyTargetWarning = { code: string; message: string };

export type DailyTargetResolution = {
  requestedProfile: UserProfileForTargets;
  profile: UserProfileForTargets;
  warnings: DailyTargetWarning[];
  targets: NutrientTarget[];
};

export type IntakeRuleRow = {
  ruleKey: string;
  nutrientKey: string;
  nutrientLabel?: string;
  referenceType: string;
  unit: string;
  value?: number | null;
  valueMin?: number | null;
  valueMax?: number | null;
  ageMin?: number | null;
  ageMax?: number | null;
  gender?: string;
  lifeStage?: string;
  populationGroup?: string;
  physicalActivityLevel?: string | null;
};

const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

function ageMatches(rule: IntakeRuleRow, age: number): boolean {
  if (isNumber(rule.ageMin) && age < rule.ageMin) return false;
  if (isNumber(rule.ageMax) && age >= rule.ageMax) return false;
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

function isSpecialLifeStage(stage?: string): boolean {
  return Boolean(stage && (stage.startsWith("pregnancy") || stage === "lactation"));
}

function isSpecialRule(rule: IntakeRuleRow): boolean {
  return rule.populationGroup === "pregnant" || rule.populationGroup === "lactating" || isSpecialLifeStage(rule.lifeStage);
}

export function normalizeDailyTargetProfile(input: UserProfileForTargets): { profile: UserProfileForTargets; warnings: DailyTargetWarning[] } {
  const warnings: DailyTargetWarning[] = [];
  const inferredPopulation = inferPopulationGroup(input.age);
  let gender = input.gender;
  const lifeStage = normalizeLifeStage(input.lifeStage);
  let populationGroup = input.populationGroup || inferredPopulation;
  let physicalActivityLevel = input.physicalActivityLevel;

  const lifeStagePopulation = populationForLifeStage(lifeStage);
  if (lifeStagePopulation) {
    if (gender !== "female") {
      warnings.push({ code: "life_stage_gender_adjusted", message: "Pregnancy/lactation targets require female gender; gender was adjusted to female." });
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
    warnings.push({ code: "pal_adjusted", message: "WST578 energy rows use light/moderate/heavy activity; rest was adjusted to light." });
    physicalActivityLevel = "light";
  }

  return { profile: { age: input.age, gender, lifeStage, populationGroup, physicalActivityLevel }, warnings };
}

/** Score how specific a candidate rule is for the profile. Higher = better; -Infinity = incompatible. */
function specificityScore(rule: IntakeRuleRow, profile: UserProfileForTargets): number {
  let score = 0;

  if (rule.gender === profile.gender) score += 4;
  else if (rule.gender === "all") score += 1;
  else return -Infinity;

  if (isNumber(rule.ageMin) && isNumber(rule.ageMax)) {
    score += 3;
    score -= (rule.ageMax - rule.ageMin) * 0.05;
  } else if (isNumber(rule.ageMin)) {
    score += 1;
  }

  const lifeStage = profile.lifeStage ?? "general";
  if (rule.lifeStage === lifeStage) score += 3;
  else if (lifeStage === "pregnancy" && rule.lifeStage?.startsWith("pregnancy")) score += 2.5;
  else if (lifeStage.startsWith("pregnancy") && rule.lifeStage === "pregnancy") score += 2;
  else if (rule.lifeStage === "general" || !rule.lifeStage) score += 1;
  else return -Infinity;

  // Pregnancy/lactation can inherit the age-based base rows, but child/adult/senior groups must not leak.
  const populationGroup = profile.populationGroup ?? "general";
  const agePopulation = inferPopulationGroup(profile.age);
  const specialPopulation = populationGroup === "pregnant" || populationGroup === "lactating";
  if (rule.populationGroup === populationGroup) score += 2;
  else if (specialPopulation && rule.populationGroup === agePopulation) score += 1.25;
  else if (rule.populationGroup === "general" || !rule.populationGroup) score += 0.5;
  else return -Infinity;

  // Prefer the closest lower age boundary when source rows are open-ended ("11～", "18～").
  if (!isSpecialRule(rule) && isNumber(rule.ageMin)) score += Math.min(rule.ageMin, profile.age) * 0.02;

  if (rule.physicalActivityLevel && profile.physicalActivityLevel) {
    if (rule.physicalActivityLevel === profile.physicalActivityLevel) score += 2;
    else return -Infinity;
  } else if (rule.physicalActivityLevel && !profile.physicalActivityLevel) {
    score -= 0.5;
  }

  return score;
}

function pickValue(rule: IntakeRuleRow): number | undefined {
  if (isNumber(rule.value)) return rule.value;
  if (isNumber(rule.valueMin) && isNumber(rule.valueMax)) return (rule.valueMin + rule.valueMax) / 2;
  if (isNumber(rule.valueMax)) return rule.valueMax;
  if (isNumber(rule.valueMin)) return rule.valueMin;
  return undefined;
}

function pickGoalType(target: NutrientTarget): NutrientTarget["goalType"] {
  if (isNumber(target.RNI)) return "RNI";
  if (isNumber(target.AI)) return "AI";
  if (isNumber(target.EER)) return "EER";
  if (isNumber(target.EAR)) return "EAR";
  return undefined;
}

/** Genders worth loading for a profile (the repository pre-filter). */
export function candidateGenders(profile: UserProfileForTargets): string[] {
  return profile.gender === "all" ? ["all"] : [profile.gender, "all"];
}

/**
 * Keep the top-scored rule per (nutrientKey, referenceType), then group by nutrient so RNI / EAR / AI /
 * UL / EER / AMDR surface together.
 */
export function computeTargets(candidates: IntakeRuleRow[], profile: UserProfileForTargets): NutrientTarget[] {
  const buckets = new Map<string, { rule: IntakeRuleRow; score: number }>();
  for (const rule of candidates) {
    if (!isSpecialRule(rule) && !ageMatches(rule, profile.age)) continue;
    const score = specificityScore(rule, profile);
    if (score === -Infinity) continue;
    const key = `${rule.nutrientKey}::${rule.referenceType}`;
    const current = buckets.get(key);
    if (!current || score > current.score) buckets.set(key, { rule, score });
  }

  type Acc = NutrientTarget & { refTypes: Set<string>; unitByType: Map<string, string> };
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
        refTypes: new Set(),
        unitByType: new Map()
      };
      byNutrient.set(rule.nutrientKey, acc);
    }

    const refType = rule.referenceType.toUpperCase();
    if (acc.refTypes.has(refType)) continue;
    acc.refTypes.add(refType);
    acc.sourceRuleKeys.push(rule.ruleKey);
    acc.unitByType.set(refType, rule.unit);
    if (refType === "RNI") acc.RNI = value;
    else if (refType === "AI") acc.AI = value;
    else if (refType === "EAR") acc.EAR = value;
    else if (refType === "UL") acc.UL = value;
    else if (refType === "EER") acc.EER = value;
    else if (refType === "AMDR") {
      acc.AMDR = { value: rule.value ?? undefined, min: rule.valueMin ?? undefined, max: rule.valueMax ?? undefined, unit: rule.unit };
    }
  }

  return [...byNutrient.values()]
    .map(({ refTypes: _refTypes, unitByType, ...rest }) => {
      const goalType = pickGoalType(rest);
      const units = Object.fromEntries(unitByType.entries()) as NutrientTarget["units"];
      return { ...rest, goalType, unit: (goalType ? units?.[goalType] : undefined) ?? rest.unit, units };
    })
    .sort((a, b) => a.nutrientKey.localeCompare(b.nutrientKey));
}

/** Single "personal goal" per nutrient: RNI > AI > EER > EAR. */
export function preferredGoal(target: NutrientTarget): number | undefined {
  return target.RNI ?? target.AI ?? target.EER ?? target.EAR;
}

import lpModule, { type Model } from "javascript-lp-solver";
import { preferredGoal, type NutrientTarget } from "./daily-targets.js";

// The package's typings describe its CommonJS build (default import = namespace) while Node loads the
// ESM build (default import = solver); accept both shapes.
const solver = ((lpModule as unknown as { default?: typeof lpModule.default }).default ?? lpModule) as typeof lpModule.default;

/**
 * Linear-programming diet optimizer, moved from the legacy Foodvisor backend (services/dietOptimizer.ts).
 * Pure: the service loads the food pool and constraints; this file selects candidates, builds the LP
 * (minimise kcal subject to nutrient bounds) and summarises the solution. Food values are per 100 g.
 */
export type OptimizerConstraint = {
  nutrientKey: string;
  nutrientLabel: string;
  unit: string;
  lowerBound: number;
  upperBound: number;
  isPercentOfCalories: boolean;
  caloriesPerGram: number;
};

export type OptimizerFood = {
  id: string;
  koreanName: string;
  category: string | null;
  sourceFoodId: string | null;
  dataSource: string | null;
  calories: number;
  macros: Record<string, number | undefined>;
  sugar: number;
  saturatedFat: number;
  cholesterolMg: number;
  vitamins: Record<string, number | undefined>;
  minerals: Record<string, number | undefined>;
  sourceNutrition: Record<string, number | undefined>;
};

export type CandidateOptions = {
  candidateLimit?: number;
  topPerNutrient?: number;
  excludeTerms?: string[];
};

/** DRI nutrient keys (nutrient_intake_rules.nutrient_key) -> LP variable keys computed from foods. */
const DRI_KEY_TO_LP_KEY: Record<string, string> = {
  energyKcal: "energyKcal",
  protein: "proteinG",
  fat: "totalFatG",
  carbs: "carbohydrateG",
  fiber: "dietaryFiberG",
  saturatedFat: "saturatedFatG",
  cholesterol: "cholesterolMg",
  sodium: "sodiumMg",
  potassium: "potassiumMg",
  calcium: "calciumMg",
  magnesium: "magnesiumMg",
  iron: "ironMg",
  zinc: "zincMg",
  vitaminA: "vitaminAUg",
  vitaminB1: "thiaminMg",
  vitaminB2: "riboflavinMg",
  niacin: "niacinMg",
  vitaminB6: "vitaminB6Mg",
  vitaminB12: "vitaminB12Ug",
  vitaminC: "vitaminCMg",
  vitaminD: "vitaminDMcg",
  vitaminE: "vitaminEMg",
  vitaminK: "vitaminKUg",
  folate: "dietaryFolateUg"
};

function num(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function foodNutrient(food: OptimizerFood, nutrientKey: string): number {
  const sourceValue = num(food.sourceNutrition?.[nutrientKey]);
  if (sourceValue) return sourceValue;

  const fallbacks: Record<string, number> = {
    energyKcal: num(food.calories),
    proteinG: num(food.macros?.protein),
    totalFatG: num(food.macros?.fat),
    carbohydrateG: num(food.macros?.carbs),
    dietaryFiberG: num(food.macros?.fiber),
    sugarG: num(food.sugar),
    saturatedFatG: num(food.saturatedFat),
    cholesterolMg: num(food.cholesterolMg),
    calciumMg: num(food.minerals?.calcium),
    ironMg: num(food.minerals?.iron),
    magnesiumMg: num(food.minerals?.magnesium),
    potassiumMg: num(food.minerals?.potassium),
    sodiumMg: num(food.minerals?.sodium),
    zincMg: num(food.minerals?.zinc),
    vitaminAUg: num(food.vitamins?.vitaminA),
    thiaminMg: num(food.vitamins?.vitaminB1),
    riboflavinMg: num(food.vitamins?.vitaminB2),
    niacinMg: num(food.vitamins?.vitaminB3),
    vitaminB6Mg: num(food.vitamins?.vitaminB6),
    vitaminB12Ug: num(food.vitamins?.vitaminB12),
    vitaminCMg: num(food.vitamins?.vitaminC),
    vitaminDMcg: num(food.vitamins?.vitaminD),
    vitaminEMg: num(food.vitamins?.vitaminE),
    vitaminKUg: num(food.vitamins?.vitaminK),
    dietaryFolateUg: num(food.vitamins?.folate)
  };
  return fallbacks[nutrientKey] ?? 0;
}

export function normalizeConstraint(constraint: Partial<OptimizerConstraint> & { nutrientKey: string }): OptimizerConstraint {
  return {
    nutrientKey: constraint.nutrientKey,
    nutrientLabel: constraint.nutrientLabel || constraint.nutrientKey,
    unit: constraint.unit || "",
    lowerBound: num(constraint.lowerBound),
    upperBound: num(constraint.upperBound),
    isPercentOfCalories: Boolean(constraint.isPercentOfCalories),
    caloriesPerGram: num(constraint.caloriesPerGram)
  };
}

/** Lower bound = personal goal (RNI > AI > EER > EAR), upper bound = UL; unmappable nutrients are skipped. */
export function constraintsFromTargets(targets: NutrientTarget[]): OptimizerConstraint[] {
  const constraints: OptimizerConstraint[] = [];
  for (const target of targets) {
    const lpKey = DRI_KEY_TO_LP_KEY[target.nutrientKey];
    if (!lpKey) continue;
    const goal = preferredGoal(target);
    const lowerBound = typeof goal === "number" ? goal : 0;
    const upperBound = typeof target.UL === "number" ? target.UL : 0;
    if (!lowerBound && !upperBound) continue;
    constraints.push(normalizeConstraint({ nutrientKey: lpKey, nutrientLabel: target.nutrientLabel, unit: target.unit, lowerBound, upperBound }));
  }
  return constraints;
}

export function excludeByTerms(pool: OptimizerFood[], terms: string[] = []): OptimizerFood[] {
  const normalized = terms.map((term) => term.trim().toLowerCase()).filter(Boolean);
  if (!normalized.length) return pool;
  return pool.filter((food) => !normalized.some((term) => food.koreanName.toLowerCase().includes(term)));
}

/**
 * Seed the LP candidate set with the most nutrient-dense foods for every lower-bound constraint,
 * then add a broad baseline so the solver can mix practical staples with dense sources.
 */
export function chooseCandidates(pool: OptimizerFood[], constraints: OptimizerConstraint[], options: CandidateOptions): OptimizerFood[] {
  const candidateLimit = Math.min(Math.max(options.candidateLimit || 1600, 50), 6000);
  const topPerNutrient = Math.min(Math.max(options.topPerNutrient || 70, 10), 300);
  const selected = new Map<string, OptimizerFood>();

  for (const constraint of constraints) {
    if (!constraint.lowerBound || constraint.isPercentOfCalories) continue;
    [...pool]
      .filter((food) => foodNutrient(food, constraint.nutrientKey) > 0)
      .sort((a, b) => {
        const aDensity = foodNutrient(a, constraint.nutrientKey) / Math.max(foodNutrient(a, "energyKcal"), 1);
        const bDensity = foodNutrient(b, constraint.nutrientKey) / Math.max(foodNutrient(b, "energyKcal"), 1);
        return bDensity - aDensity;
      })
      .slice(0, topPerNutrient)
      .forEach((food) => selected.set(food.id, food));
  }

  pool.slice(0, Math.min(pool.length, candidateLimit)).forEach((food) => selected.set(food.id, food));
  return [...selected.values()].slice(0, candidateLimit);
}

export type DietSolution =
  | { feasible: false; message: string; candidateCount: number; constraintCount: number }
  | {
      feasible: true;
      totalCalories: number;
      foods: Array<{ foodId: string; sourceFoodId: string | null; name: string; category: string | null; grams: number; servings100g: number; calories: number }>;
      nutrients: Array<{ nutrientKey: string; nutrientLabel: string; unit: string; total: number; lowerBound?: number; upperBound?: number; percentOfCalories?: number }>;
      candidateCount: number;
    };

export function solveDiet(candidates: OptimizerFood[], constraints: OptimizerConstraint[], maxServingsPerFood: number): DietSolution {
  const model: Model = { optimize: "objectiveCalories", opType: "min", constraints: {}, variables: {} };
  const foodByVariable = new Map<string, OptimizerFood>();

  for (const constraint of constraints) {
    if (constraint.isPercentOfCalories) {
      if (constraint.lowerBound) model.constraints[`${constraint.nutrientKey}PercentLower`] = { min: 0 };
      if (constraint.upperBound) model.constraints[`${constraint.nutrientKey}PercentUpper`] = { max: 0 };
      continue;
    }
    const bounds: { min?: number; max?: number } = {};
    if (constraint.lowerBound) bounds.min = constraint.lowerBound;
    if (constraint.upperBound) bounds.max = constraint.upperBound;
    if (bounds.min !== undefined || bounds.max !== undefined) model.constraints[constraint.nutrientKey] = bounds;
  }

  candidates.forEach((food, index) => {
    const variableName = `food_${index}`;
    const variable: Record<string, number> = {
      objectiveCalories: foodNutrient(food, "energyKcal"),
      energyKcal: foodNutrient(food, "energyKcal")
    };
    for (const constraint of constraints) {
      if (constraint.isPercentOfCalories) {
        // Percent-of-energy bounds are linearised as nutrientCalories - targetRatio * totalCalories.
        const nutrientCalories = foodNutrient(food, constraint.nutrientKey) * (constraint.caloriesPerGram || 9);
        const totalCalories = foodNutrient(food, "energyKcal");
        if (constraint.lowerBound) variable[`${constraint.nutrientKey}PercentLower`] = nutrientCalories - totalCalories * (constraint.lowerBound / 100);
        if (constraint.upperBound) variable[`${constraint.nutrientKey}PercentUpper`] = nutrientCalories - totalCalories * (constraint.upperBound / 100);
      } else {
        variable[constraint.nutrientKey] = foodNutrient(food, constraint.nutrientKey);
      }
    }
    const maxConstraintName = `maxFood_${index}`;
    model.constraints[maxConstraintName] = { max: maxServingsPerFood };
    variable[maxConstraintName] = 1;
    model.variables[variableName] = variable;
    foodByVariable.set(variableName, food);
  });

  const solution = solver.Solve(model) as Record<string, number | boolean | undefined> & { feasible: boolean; result: number };
  if (!solution.feasible) {
    return {
      feasible: false,
      message: "No feasible diet found for the selected foods and constraints.",
      candidateCount: candidates.length,
      constraintCount: constraints.length
    };
  }

  const chosen = [...foodByVariable.entries()]
    .map(([variableName, food]) => ({ food, servings100g: Number(solution[variableName] || 0) }))
    .filter((entry) => entry.servings100g > 1e-7);

  const foods = chosen
    .map(({ food, servings100g }) => ({
      foodId: food.id,
      sourceFoodId: food.sourceFoodId,
      name: food.koreanName,
      category: food.category,
      grams: Number((servings100g * 100).toFixed(1)),
      servings100g: Number(servings100g.toFixed(4)),
      calories: Number((foodNutrient(food, "energyKcal") * servings100g).toFixed(1))
    }))
    .sort((a, b) => b.grams - a.grams);

  const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);
  const nutrients = constraints.map((constraint) => {
    const total = chosen.reduce((sum, { food, servings100g }) => sum + foodNutrient(food, constraint.nutrientKey) * servings100g, 0);
    const percentOfCalories =
      constraint.isPercentOfCalories && totalCalories
        ? Number(((total * (constraint.caloriesPerGram || 9) * 100) / totalCalories).toFixed(1))
        : undefined;
    return {
      nutrientKey: constraint.nutrientKey,
      nutrientLabel: constraint.nutrientLabel,
      unit: constraint.unit,
      total: Number(total.toFixed(3)),
      lowerBound: constraint.lowerBound || undefined,
      upperBound: constraint.upperBound || undefined,
      percentOfCalories
    };
  });

  return { feasible: true, totalCalories: Number(solution.result.toFixed(1)), foods, nutrients, candidateCount: candidates.length };
}

import { createRequire } from "module";
import type { Model as LinearModel } from "javascript-lp-solver";
import { Food } from "../models/food.js";
import { NutritionConstraint } from "../models/nutrition-constraint.js";
import { getDailyTargets, preferredGoal, type UserProfileForTargets } from "./dailyTargets.js";

const require = createRequire(import.meta.url);
const linearSolver = require("javascript-lp-solver") as { Solve: (model: LinearModel) => unknown };

type ConstraintInput = {
  nutrientKey: string;
  nutrientLabel?: string;
  unit?: string;
  lowerBound?: number;
  upperBound?: number;
  isPercentOfCalories?: boolean;
  caloriesPerGram?: number;
};

type OptimizeDietInput = {
  profileKey?: string;
  /** When provided, derives constraints from WST578 daily targets for this profile. */
  targetProfile?: UserProfileForTargets;
  dataSource?: string;
  candidateLimit?: number;
  poolLimit?: number;
  maxServingsPerFood?: number;
  topPerNutrient?: number;
  includeCategories?: string[];
  excludeCategories?: string[];
  excludeTerms?: string[];
  constraints?: ConstraintInput[];
};

/**
 * Map our DRI nutrient keys (matching NutrientIntakeRule.nutrientKey) to the foodNutrient()
 * keys used inside the LP variables. Nutrients without a mapping get filtered out — we can
 * only constrain what we can compute from the Food collection.
 */
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

type FoodCandidate = {
  _id: unknown;
  koreanName?: string;
  category?: string;
  foodGroup?: string;
  foodSubgroup?: string;
  servingSize?: string;
  calories?: number;
  macros?: {
    protein?: number;
    fat?: number;
    carbs?: number;
    fiber?: number;
  };
  sugar?: number;
  saturatedFat?: number;
  cholesterolMg?: number;
  vitamins?: Record<string, number>;
  minerals?: Record<string, number>;
  sourceFoodId?: string;
  dataSource?: string;
  sourceNutrition?: Record<string, number>;
};

type SolverResult = {
  feasible: boolean;
  bounded?: boolean;
  result: number;
  [variableName: string]: number | boolean | undefined;
};

const defaultProfileKey = "lp-diet-sr28-adult";

function num(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function foodNutrient(food: FoodCandidate, nutrientKey: string) {
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

async function constraintsFromTargetProfile(profile: UserProfileForTargets) {
  const targets = await getDailyTargets(profile);
  const constraints = [] as Array<ReturnType<typeof normalizeConstraint>>;
  for (const target of targets) {
    const lpKey = DRI_KEY_TO_LP_KEY[target.nutrientKey];
    if (!lpKey) continue;   // skip nutrients we can't compute from the Food collection
    const goal = preferredGoal(target);
    const lowerBound = typeof goal === "number" ? goal : 0;
    const upperBound = typeof target.UL === "number" ? target.UL : 0;
    if (!lowerBound && !upperBound) continue;
    constraints.push(normalizeConstraint({
      nutrientKey: lpKey,
      nutrientLabel: target.nutrientLabel,
      unit: target.unit,
      lowerBound,
      upperBound
    }));
  }
  return constraints;
}

function normalizeConstraint(constraint: ConstraintInput) {
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

async function loadConstraints(input: OptimizeDietInput) {
  if (Array.isArray(input.constraints) && input.constraints.length) {
    return input.constraints.map(normalizeConstraint);
  }

  if (input.targetProfile) {
    const derived = await constraintsFromTargetProfile(input.targetProfile);
    if (derived.length) return derived;
  }

  return NutritionConstraint.find({
    profileKey: input.profileKey || defaultProfileKey
  })
    .sort({ nutrientKey: 1 })
    .lean()
    .then((items) =>
      items.map((constraint) =>
        normalizeConstraint({
          nutrientKey: String(constraint.nutrientKey),
          nutrientLabel: String(constraint.nutrientLabel),
          unit: String(constraint.unit || ""),
          lowerBound: num(constraint.lowerBound),
          upperBound: num(constraint.upperBound),
          isPercentOfCalories: Boolean(constraint.isPercentOfCalories),
          caloriesPerGram: num(constraint.caloriesPerGram)
        })
      )
    );
}

async function loadFoodPool(input: OptimizeDietInput) {
  const includeCategories = new Set((input.includeCategories || []).map(normalizeText));
  const excludeCategories = new Set((input.excludeCategories || []).map(normalizeText));
  const excludeTerms = (input.excludeTerms || []).map(normalizeText).filter(Boolean);
  const filter: Record<string, unknown> = {
    calories: { $gt: 0 }
  };
  const dataSource = String(input.dataSource || "").trim();

  if (dataSource && dataSource.toLowerCase() !== "all") {
    filter.dataSource = dataSource;
  }

  if (includeCategories.size) {
    filter.category = { $in: [...includeCategories] };
  }
  if (excludeCategories.size) {
    filter.category = { $nin: [...excludeCategories] };
  }

  const foods = await Food.find(filter)
    .sort({ dataSource: 1, sourceFoodId: 1, koreanName: 1 })
    .limit(Math.min(Math.max(input.poolLimit || 30000, 100), 50000))
    .select("koreanName category foodGroup foodSubgroup servingSize calories macros sugar saturatedFat cholesterolMg vitamins minerals sourceFoodId dataSource sourceNutrition")
    .lean();

  if (!excludeTerms.length) return foods as FoodCandidate[];

  return (foods as FoodCandidate[]).filter((food) => {
    const name = normalizeText(String(food.koreanName || ""));
    return !excludeTerms.some((term) => name.includes(term));
  });
}

function chooseCandidates(pool: FoodCandidate[], constraints: ConstraintInput[], input: OptimizeDietInput) {
  const candidateLimit = Math.min(Math.max(input.candidateLimit || 1600, 50), 6000);
  const topPerNutrient = Math.min(Math.max(input.topPerNutrient || 70, 10), 300);
  const selected = new Map<string, FoodCandidate>();

  const addFood = (food: FoodCandidate) => {
    selected.set(String(food._id), food);
  };

  // Joseon language: foods Among the foods in the database, candidates with high nutrients are first selected..
  // English: Seed the LP candidate set with nutrient-dense foods for every lower-bound constraint.
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
      .forEach(addFood);
  }

  // Joseon language: foods General candidates from the data base are also added to ensure that only special foods are left behind..
  // English: Add a broad baseline so the solver can mix practical staples with dense nutrient sources.
  pool.slice(0, Math.min(pool.length, candidateLimit)).forEach(addFood);

  return [...selected.values()].slice(0, candidateLimit);
}

export async function optimizeDiet(input: OptimizeDietInput = {}) {
  const constraints = await loadConstraints(input);
  if (!constraints.length) {
    throw new Error("No nutrition constraints found. Run import:lp-diet-sr28 or pass constraints in the request body.");
  }

  const pool = await loadFoodPool(input);
  if (!pool.length) {
    throw new Error("No foods found for diet optimization. Add foods to the foods collection or loosen the dataSource/category filters.");
  }

  const candidates = chooseCandidates(pool, constraints, input);
  const maxServingsPerFood = Math.min(Math.max(input.maxServingsPerFood || 10, 0.25), 50);
  const model: LinearModel = {
    optimize: "objectiveCalories",
    opType: "min",
    constraints: {},
    variables: {}
  };
  const foodByVariable = new Map<string, FoodCandidate>();

  for (const constraint of constraints) {
    if (constraint.isPercentOfCalories) {
      if (constraint.lowerBound) {
        model.constraints[`${constraint.nutrientKey}PercentLower`] = { min: 0 };
      }
      if (constraint.upperBound) {
        model.constraints[`${constraint.nutrientKey}PercentUpper`] = { max: 0 };
      }
      continue;
    }

    const bounds: { min?: number; max?: number } = {};
    if (constraint.lowerBound) bounds.min = constraint.lowerBound;
    if (constraint.upperBound) bounds.max = constraint.upperBound;
    if (bounds.min !== undefined || bounds.max !== undefined) {
      model.constraints[constraint.nutrientKey] = bounds;
    }
  }

  candidates.forEach((food, index) => {
    const variableName = `food_${index}`;
    const variable: Record<string, number> = {
      objectiveCalories: foodNutrient(food, "energyKcal"),
      energyKcal: foodNutrient(food, "energyKcal")
    };

    for (const constraint of constraints) {
      if (constraint.isPercentOfCalories) {
        const fatCalories = foodNutrient(food, constraint.nutrientKey) * (constraint.caloriesPerGram || 9);
        const totalCalories = foodNutrient(food, "energyKcal");

        // Joseon language: The fat ratio constraint is 9*fat(g) - target ratio*Convert calories to a linear equation:.
        // English: Percent-of-calorie constraints are linearized as fatCalories - targetRatio * totalCalories.
        if (constraint.lowerBound) {
          variable[`${constraint.nutrientKey}PercentLower`] = fatCalories - totalCalories * (constraint.lowerBound / 100);
        }
        if (constraint.upperBound) {
          variable[`${constraint.nutrientKey}PercentUpper`] = fatCalories - totalCalories * (constraint.upperBound / 100);
        }
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

  const solution = linearSolver.Solve(model) as SolverResult;
  if (!solution.feasible) {
    return {
      feasible: false,
      message: "No feasible diet found for the selected foods and constraints.",
      candidateCount: candidates.length,
      constraintCount: constraints.length
    };
  }

  const chosenFoods = [...foodByVariable.entries()]
    .map(([variableName, food]) => ({
      variableName,
      food,
      servings100g: Number(solution[variableName] || 0)
    }))
    .filter((entry) => entry.servings100g > 1e-7)
    .map((entry) => ({
      foodId: entry.food._id,
      sourceFoodId: entry.food.sourceFoodId,
      name: entry.food.koreanName,
      category: entry.food.category,
      grams: Number((entry.servings100g * 100).toFixed(1)),
      servings100g: Number(entry.servings100g.toFixed(4)),
      calories: Number((foodNutrient(entry.food, "energyKcal") * entry.servings100g).toFixed(1))
    }))
    .sort((a, b) => b.grams - a.grams);

  const nutrientTotals = constraints.map((constraint) => {
    const total = chosenFoods.reduce((sum, chosen) => {
      const food = candidates.find((candidate) => String(candidate._id) === String(chosen.foodId));
      return sum + (food ? foodNutrient(food, constraint.nutrientKey) * chosen.servings100g : 0);
    }, 0);
    const calories = chosenFoods.reduce((sum, chosen) => sum + chosen.calories, 0);
    const percentOfCalories = constraint.isPercentOfCalories && calories
      ? Number(((total * (constraint.caloriesPerGram || 9) * 100) / calories).toFixed(1))
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

  return {
    feasible: true,
    objective: "minimize energyKcal while satisfying nutrition constraints",
    dataSource: input.dataSource || "all foods collection",
    profileKey: input.profileKey || defaultProfileKey,
    candidateCount: candidates.length,
    poolCount: pool.length,
    maxServingsPerFood,
    totalCalories: Number(solution.result.toFixed(1)),
    foods: chosenFoods,
    nutrients: nutrientTotals
  };
}

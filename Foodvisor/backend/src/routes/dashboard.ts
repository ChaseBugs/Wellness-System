import { Router } from "express";
import { Activity } from "../models/activity.js";
import { ConditionDietCondition } from "../models/condition-diet-condition.js";
import { ConditionDietRule } from "../models/condition-diet-rule.js";
import { DataValidationRule } from "../models/data-validation-rule.js";
import { Food } from "../models/food.js";
import { MealLog } from "../models/meal-log.js";
import { NutrientIntakeRule } from "../models/nutrient-intake-rule.js";
import { NutritionTerminology } from "../models/nutrition-terminology.js";
import { Program } from "../models/program.js";
import { Recipe } from "../models/recipe.js";
import { ReferenceSource } from "../models/reference-source.js";
import { RiskAssessmentRule } from "../models/risk-assessment-rule.js";
import { User } from "../models/user.js";
import { WeightEntry } from "../models/weight-entry.js";

export const dashboardRouter = Router();

const RESOURCES = [
  { key: "foods", model: Food, labelField: "koreanName" },
  { key: "recipes", model: Recipe, labelField: "title" },
  { key: "activities", model: Activity, labelField: "name" },
  { key: "users", model: User, labelField: "name" },
  { key: "mealLogs", model: MealLog, labelField: "foodName" },
  { key: "weightEntries", model: WeightEntry, labelField: "userName" },
  { key: "programs", model: Program, labelField: "title" },
  { key: "referenceSources", model: ReferenceSource, labelField: "title" },
  { key: "nutrientIntakeRules", model: NutrientIntakeRule, labelField: "ruleKey" },
  { key: "conditionDietConditions", model: ConditionDietCondition, labelField: "conditionLabel" },
  { key: "conditionDietRules", model: ConditionDietRule, labelField: "ruleKey" },
  { key: "riskAssessmentRules", model: RiskAssessmentRule, labelField: "metricLabel" },
  { key: "nutritionTerminology", model: NutritionTerminology, labelField: "chineseTerm" },
  { key: "dataValidationRules", model: DataValidationRule, labelField: "fieldPath" }
] as const;

dashboardRouter.get("/", async (_req, res, next) => {
  try {
    const totalsArr = await Promise.all(RESOURCES.map((r) => r.model.countDocuments()));
    const unverifiedArr = await Promise.all(RESOURCES.map((r) =>
      r.model.schema.path("doctor_verified") ? r.model.countDocuments({ doctor_verified: false }) : Promise.resolve(0)
    ));

    const totals: Record<string, number> = {};
    const unverified: Record<string, number> = {};
    RESOURCES.forEach((r, i) => {
      totals[r.key] = totalsArr[i];
      unverified[r.key] = unverifiedArr[i];
    });

    const caloriesAgg = await MealLog.aggregate([{ $group: { _id: null, total: { $sum: "$calories" } } }]);
    totals.caloriesLogged = caloriesAgg[0]?.total ?? 0;

    const recentRaw = await Promise.all(
      RESOURCES.map(async (r) => {
        const items = await r.model.find().sort({ createdAt: -1 }).limit(2).lean() as Array<Record<string, unknown>>;
        return items.map((it) => ({
          resource: r.key,
          id: String(it._id),
          label: String(it[r.labelField] ?? it.name ?? it.title ?? "(no label)"),
          createdAt: it.createdAt
        }));
      })
    );
    const recentAdditions = recentRaw.flat()
      .filter((x) => x.createdAt)
      .sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime())
      .slice(0, 12);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    const days: { date: string; total: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo); d.setDate(d.getDate() + i);
      days.push({ date: d.toISOString().slice(0, 10), total: 0 });
    }
    const trendCounts = await Promise.all(
      RESOURCES.map((r) => r.model.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, c: { $sum: 1 } } }
      ]))
    );
    const dayMap = new Map(days.map((d) => [d.date, d]));
    trendCounts.flat().forEach((row: any) => {
      const d = dayMap.get(row._id);
      if (d) d.total += row.c;
    });

    res.json({ totals, unverified, recentAdditions, trend: { last30Days: days } });
  } catch (error) {
    next(error);
  }
});

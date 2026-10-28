import { Router } from "express";
import { ValidationError } from "../utils/errors.js";
import { analyzeIntake } from "../services/dailyIntakeAnalyzer.js";
import type { UserProfileForTargets } from "../services/dailyTargets.js";

export const dailyIntakeRouter = Router();

function parseDate(raw: unknown, fallback?: Date): Date {
  if (!raw) {
    if (fallback) return fallback;
    throw new ValidationError("missing date");
  }
  const d = new Date(String(raw));
  if (Number.isNaN(d.getTime())) throw new ValidationError(`invalid date: ${String(raw)}`);
  return d;
}

dailyIntakeRouter.get("/analyze", async (req, res, next) => {
  try {
    const userName = String(req.query.userName ?? "").trim();
    if (!userName) throw new ValidationError("userName is required");

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);

    const from = parseDate(req.query.from, startOfToday);
    const to = parseDate(req.query.to, endOfToday);

    const age = Number(req.query.age);
    if (!Number.isFinite(age) || age < 0 || age > 120) {
      throw new ValidationError("age must be 0–120");
    }
    const genderRaw = String(req.query.gender ?? "all");
    const gender: UserProfileForTargets["gender"] =
      genderRaw === "male" || genderRaw === "female" ? genderRaw : "all";

    const profile: UserProfileForTargets = {
      age,
      gender,
      lifeStage: req.query.lifeStage ? String(req.query.lifeStage) : undefined,
      populationGroup: req.query.populationGroup ? String(req.query.populationGroup) : undefined,
      physicalActivityLevel: req.query.pal ? String(req.query.pal) : undefined
    };

    const report = await analyzeIntake({ userName, from, to, profile });
    res.json(report);
  } catch (error) {
    next(error);
  }
});

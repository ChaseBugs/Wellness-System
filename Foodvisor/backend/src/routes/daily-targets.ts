import { Router } from "express";
import { ValidationError } from "../utils/errors.js";
import { User } from "../models/user.js";
import {
  preferredGoal,
  resolveDailyTargets,
  type DailyTargetResolution,
  type UserProfileForTargets
} from "../services/dailyTargets.js";

export const dailyTargetsRouter = Router();

function parseProfileInput(input: Record<string, unknown>): UserProfileForTargets {
  const age = Number(input.age);
  if (!Number.isFinite(age) || age < 0 || age > 120) {
    throw new ValidationError("age must be a finite number 0-120");
  }

  const genderRaw = String(input.gender ?? "all");
  const gender: UserProfileForTargets["gender"] =
    genderRaw === "male" || genderRaw === "female" ? genderRaw : "all";

  return {
    age,
    gender,
    lifeStage: input.lifeStage ? String(input.lifeStage) : undefined,
    populationGroup: input.populationGroup ? String(input.populationGroup) : undefined,
    physicalActivityLevel: input.physicalActivityLevel
      ? String(input.physicalActivityLevel)
      : input.pal
        ? String(input.pal)
        : undefined
  };
}

function projectGenderForUser(userGender: string | undefined): UserProfileForTargets["gender"] {
  if (userGender === "male" || userGender === "female") return userGender;
  return "all";
}

function dailyTargetsPayload(resolution: DailyTargetResolution, extra: Record<string, unknown> = {}) {
  const { requestedProfile, profile, warnings, targets } = resolution;
  return {
    ...extra,
    requestedProfile,
    profile,
    warnings,
    count: targets.length,
    targets,
    goals: Object.fromEntries(targets.map((target) => [target.nutrientKey, preferredGoal(target) ?? null])),
    calculation: {
      goalPriority: ["RNI", "AI", "EER", "EAR"],
      unitRule: "Each reference type keeps its own unit; AMDR is reported separately from EAR/RNI/AI/EER.",
      normalization: "Age, gender, population group, life stage, and activity level are normalized before rule matching."
    }
  };
}

dailyTargetsRouter.get("/", async (req, res, next) => {
  try {
    const resolution = await resolveDailyTargets(parseProfileInput(req.query as Record<string, unknown>));
    res.json(dailyTargetsPayload(resolution));
  } catch (error) {
    next(error);
  }
});

dailyTargetsRouter.post("/resolve", async (req, res, next) => {
  try {
    const resolution = await resolveDailyTargets(parseProfileInput(req.body as Record<string, unknown>));
    res.json(dailyTargetsPayload(resolution));
  } catch (error) {
    next(error);
  }
});

dailyTargetsRouter.get("/user/:userId", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).lean() as { age?: number; gender?: string; medicalConditions?: string[] } | null;
    if (!user) {
      throw new ValidationError("User not found");
    }
    if (typeof user.age !== "number") {
      throw new ValidationError("User has no age; daily targets need a numeric age");
    }

    const inputProfile: UserProfileForTargets = {
      age: user.age,
      gender: projectGenderForUser(user.gender),
      lifeStage: "general",
      populationGroup: undefined
    };
    const resolution = await resolveDailyTargets(inputProfile);
    res.json(dailyTargetsPayload(resolution, { userId: req.params.userId }));
  } catch (error) {
    next(error);
  }
});

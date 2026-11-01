import { ValidationError } from "../../../../utils/errors.js";
import {
  candidateGenders,
  computeTargets,
  normalizeDailyTargetProfile,
  preferredGoal,
  type DailyTargetResolution,
  type NutrientTarget,
  type UserProfileForTargets
} from "../calculators/daily-targets.js";
import type { INutritionReferenceRepository } from "../domain/INutritionReferenceRepository.js";
import type { IProfileRepository } from "../domain/IProfileRepository.js";
import type { DailyTargetsRequest, DailyTargetsResponse } from "../models/daily-target.js";

export function toTargetProfile(input: DailyTargetsRequest): UserProfileForTargets {
  const age = Number(input.age);
  if (!Number.isFinite(age) || age < 0 || age > 120) throw new ValidationError("age must be a number between 0 and 120");
  const gender = input.gender === "male" || input.gender === "female" ? input.gender : "all";
  return {
    age,
    gender,
    lifeStage: input.lifeStage || undefined,
    populationGroup: input.populationGroup || undefined,
    physicalActivityLevel: input.physicalActivityLevel || undefined
  };
}

/** Per-nutrient daily targets from the WS/T 578 Chinese Dietary Reference Intakes. */
export class DailyTargetService {
  constructor(
    private referenceRepository: INutritionReferenceRepository,
    private profileRepository: IProfileRepository
  ) {}

  async resolve(requested: UserProfileForTargets): Promise<DailyTargetResolution> {
    const { profile, warnings } = normalizeDailyTargetProfile(requested);
    const candidates = await this.referenceRepository.intakeRulesForGenders(candidateGenders(profile));
    return { requestedProfile: requested, profile, warnings, targets: computeTargets(candidates, profile) };
  }

  async targets(profile: UserProfileForTargets): Promise<NutrientTarget[]> {
    return (await this.resolve(profile)).targets;
  }

  async resolveForRequest(input: DailyTargetsRequest): Promise<DailyTargetsResponse> {
    return this.toResponse(await this.resolve(toTargetProfile(input)));
  }

  /** Targets for the signed-in user's Foodvisor profile (age and gender must be set). */
  async resolveForUser(userId: string): Promise<DailyTargetsResponse> {
    return this.toResponse(await this.resolve(await this.profileFor(userId)));
  }

  async profileFor(userId: string): Promise<UserProfileForTargets> {
    const profile = await this.profileRepository.findByUser(userId);
    if (!profile || profile.age === null) {
      throw new ValidationError("Set age (and gender) in the Foodvisor profile first: PUT /apps/foodvisor/profile");
    }
    return toTargetProfile({ age: profile.age, gender: profile.gender ?? undefined });
  }

  private toResponse(resolution: DailyTargetResolution): DailyTargetsResponse {
    return {
      ...resolution,
      count: resolution.targets.length,
      goals: Object.fromEntries(resolution.targets.map((target) => [target.nutrientKey, preferredGoal(target) ?? null])),
      calculation: {
        goalPriority: ["RNI", "AI", "EER", "EAR"],
        unitRule: "Each reference type keeps its own unit; AMDR is reported separately from EAR/RNI/AI/EER.",
        normalization: "Age, gender, population group, life stage, and activity level are normalized before rule matching."
      }
    };
  }
}

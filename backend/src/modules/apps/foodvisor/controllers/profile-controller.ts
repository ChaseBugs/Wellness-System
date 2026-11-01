import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { UpsertProfileInput } from "../models/profile.js";
import type { UpsertWeightEntryInput } from "../models/weight-entry.js";
import type { ProfileService } from "../services/profile-service.js";
import type { ProgramService } from "../services/program-service.js";
import type { WeightEntryService } from "../services/weight-entry-service.js";

const PROFILE_FIELDS = [
  "goal",
  "gender",
  "age",
  "heightCm",
  "currentWeightKg",
  "targetWeightKg",
  "activityLevel",
  "dietaryRestrictions",
  "medicalConditions",
  "programStage"
] as const;

/** The user's Foodvisor profile, weight history and program steps. */
export class ProfileController extends BaseController {
  constructor(
    private profileService: ProfileService,
    private weightEntryService: WeightEntryService,
    private programService: ProgramService
  ) {
    super();
  }

  getProfile = this.handle(async (req, res) => {
    sendSuccess(res, await this.profileService.get(this.userId(req)));
  });

  upsertProfile = this.handle(async (req, res) => {
    const input: Record<string, unknown> = {};
    for (const field of PROFILE_FIELDS) if (req.body[field] !== undefined) input[field] = req.body[field];
    sendSuccess(res, await this.profileService.upsert(this.userId(req), input as UpsertProfileInput));
  });

  weightHistory = this.handle(async (req, res) => {
    sendSuccess(res, await this.weightEntryService.history(this.userId(req)));
  });

  recordWeight = this.handle(async (req, res) => {
    const body = req.body as UpsertWeightEntryInput;
    const entry = await this.weightEntryService.record(this.userId(req), { measuredOn: body.measuredOn, weightKg: body.weightKg, note: body.note });
    sendSuccess(res, entry, 201);
  });

  deleteWeight = this.handle(async (req, res) => {
    await this.weightEntryService.delete(this.userId(req), this.param(req, "id"));
    res.status(204).end();
  });

  programs = this.handle(async (_req, res) => {
    sendSuccess(res, await this.programService.list());
  });
}

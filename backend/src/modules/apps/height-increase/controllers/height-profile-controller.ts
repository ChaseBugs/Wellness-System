import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { CreateGoalInput, Goal, UpdateGoalInput, UpsertDailyLogInput } from "../models/daily-log.js";
import type { UpdateHeightProfileInput } from "../models/height-profile.js";
import type { HeightProfileService } from "../services/height-profile-service.js";

const PROFILE_FIELDS = ["name", "targetHeightCm", "birthDate", "gender", "units", "notificationsEnabled", "avatarUrl"] as const;
const LOG_FIELDS = ["date", "heightCm", "weightKg", "sleepHours", "waterGlasses", "mood", "workoutMinutes", "completedExercises", "notes"] as const;
const GOAL_FIELDS = ["title", "type", "targetValue", "currentValue", "unit", "startsAt", "dueAt", "status"] as const;

function pick<K extends string>(source: Record<string, unknown>, fields: readonly K[]): Partial<Record<K, unknown>> {
  const out: Partial<Record<K, unknown>> = {};
  for (const field of fields) if (source[field] !== undefined) out[field] = source[field];
  return out;
}

export class HeightProfileController extends BaseController {
  constructor(private heightProfileService: HeightProfileService) {
    super();
  }

  get = this.handle(async (req, res) => {
    sendSuccess(res, await this.heightProfileService.get(this.userId(req)));
  });

  update = this.handle(async (req, res) => {
    const input = pick(req.body, PROFILE_FIELDS) as UpdateHeightProfileInput;
    sendSuccess(res, await this.heightProfileService.update(this.userId(req), input));
  });

  report = this.handle(async (req, res) => {
    const limit = this.query(req, "limit");
    sendSuccess(res, await this.heightProfileService.report(this.userId(req), limit ? Number(limit) : undefined, this.query(req, "today")));
  });

  recordLog = this.handle(async (req, res) => {
    const input = pick(req.body, LOG_FIELDS) as unknown as UpsertDailyLogInput;
    sendSuccess(res, await this.heightProfileService.recordLog(this.userId(req), input), 201);
  });

  listGoals = this.handle(async (req, res) => {
    sendSuccess(res, await this.heightProfileService.listGoals(this.userId(req), this.query(req, "status") as Goal["status"] | undefined));
  });

  createGoal = this.handle(async (req, res) => {
    const input = pick(req.body, GOAL_FIELDS.filter((field) => field !== "status")) as unknown as CreateGoalInput;
    sendSuccess(res, await this.heightProfileService.createGoal(this.userId(req), input), 201);
  });

  updateGoal = this.handle(async (req, res) => {
    const input = pick(req.body, GOAL_FIELDS) as UpdateGoalInput;
    sendSuccess(res, await this.heightProfileService.updateGoal(this.userId(req), this.param(req, "id"), input));
  });
}

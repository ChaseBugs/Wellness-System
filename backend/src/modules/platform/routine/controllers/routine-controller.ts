import type { Request } from "express";
import type { AppCode } from "../../../../config/app-catalog.js";
import { BaseController } from "../../../../utils/base-controller.js";
import { toPageQuery } from "../../../../utils/pagination.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { Difficulty } from "../../content/models/content-item.js";
import type { PublishStatus } from "../models/exercise.js";
import type { CreateRoutineInput, RoutineStepInput, UpdateRoutineInput } from "../models/routine.js";
import type { RoutineService } from "../services/routine-service.js";

const FIELDS = ["title", "description", "goal", "level", "estimatedMinutes", "tags", "isPremium"] as const;

function pick(body: Record<string, unknown>): UpdateRoutineInput {
  const picked: Record<string, unknown> = {};
  for (const field of FIELDS) if (body[field] !== undefined) picked[field] = body[field];
  if (Array.isArray(body.steps)) {
    picked.steps = (body.steps as RoutineStepInput[]).map((step) => ({
      exerciseId: step.exerciseId,
      sets: step.sets,
      reps: step.reps,
      durationSeconds: step.durationSeconds,
      restSeconds: step.restSeconds,
      notes: step.notes
    }));
  }
  return picked as UpdateRoutineInput;
}

export class RoutineController extends BaseController {
  constructor(private routineService: RoutineService) {
    super();
  }

  /** App-facing: the app comes from the module mount (fixedAppContext). */
  listPublished = this.handle(async (req, res) => {
    sendSuccess(res, await this.routineService.listPublished(this.appCode(req), this.filters(req)));
  });

  getPublished = this.handle(async (req, res) => {
    sendSuccess(res, await this.routineService.getPublished(this.appCode(req), this.param(req, "id"), this.userId(req)));
  });

  listForEditor = this.handle(async (req, res) => {
    sendSuccess(
      res,
      await this.routineService.listForEditor({
        ...this.filters(req),
        appCode: this.query(req, "app") as AppCode | undefined,
        status: this.query(req, "status") as PublishStatus | undefined
      })
    );
  });

  getForEditor = this.handle(async (req, res) => {
    sendSuccess(res, await this.routineService.getForEditor(this.param(req, "id")));
  });

  create = this.handle(async (req, res) => {
    const input = { ...pick(req.body), appCode: req.body.appCode } as CreateRoutineInput;
    sendSuccess(res, await this.routineService.create(this.userId(req), input), 201);
  });

  update = this.handle(async (req, res) => {
    sendSuccess(res, await this.routineService.update(this.param(req, "id"), pick(req.body)));
  });

  review = this.handle(async (req, res) => {
    sendSuccess(res, await this.routineService.review(this.param(req, "id"), { approve: req.body.approve === true, notes: req.body.notes }));
  });

  publish = this.handle(async (req, res) => {
    sendSuccess(res, await this.routineService.publish(this.param(req, "id")));
  });

  archive = this.handle(async (req, res) => {
    sendSuccess(res, await this.routineService.archive(this.param(req, "id")));
  });

  private filters(req: Request) {
    return {
      ...toPageQuery(req.query.page, req.query.limit),
      level: this.query(req, "level") as Difficulty | undefined,
      tag: this.query(req, "tag"),
      goal: this.query(req, "goal")
    };
  }
}

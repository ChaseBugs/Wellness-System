import type { AppCode } from "../../../../config/app-catalog.js";
import { BaseController } from "../../../../utils/base-controller.js";
import { toPageQuery } from "../../../../utils/pagination.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { CreateExerciseInput, PublishStatus, UpdateExerciseInput } from "../models/exercise.js";
import type { ExerciseService } from "../services/exercise-service.js";

const FIELDS = [
  "name",
  "description",
  "appCodes",
  "bodyAreas",
  "difficulty",
  "defaultDurationSeconds",
  "defaultReps",
  "media",
  "safetyNotes",
  "contraindications"
] as const;

function pick(body: Record<string, unknown>): UpdateExerciseInput {
  const picked: Record<string, unknown> = {};
  for (const field of FIELDS) if (body[field] !== undefined) picked[field] = body[field];
  return picked as UpdateExerciseInput;
}

export class ExerciseController extends BaseController {
  constructor(private exerciseService: ExerciseService) {
    super();
  }

  list = this.handle(async (req, res) => {
    sendSuccess(
      res,
      await this.exerciseService.list({
        ...toPageQuery(req.query.page, req.query.limit),
        appCode: this.query(req, "app") as AppCode | undefined,
        status: this.query(req, "status") as PublishStatus | undefined,
        q: this.query(req, "q")
      })
    );
  });

  get = this.handle(async (req, res) => {
    sendSuccess(res, await this.exerciseService.get(this.param(req, "id")));
  });

  create = this.handle(async (req, res) => {
    sendSuccess(res, await this.exerciseService.create(this.userId(req), pick(req.body) as CreateExerciseInput), 201);
  });

  update = this.handle(async (req, res) => {
    sendSuccess(res, await this.exerciseService.update(this.param(req, "id"), pick(req.body)));
  });

  review = this.handle(async (req, res) => {
    sendSuccess(res, await this.exerciseService.review(this.param(req, "id"), { approve: req.body.approve === true, notes: req.body.notes }));
  });

  publish = this.handle(async (req, res) => {
    sendSuccess(res, await this.exerciseService.publish(this.param(req, "id")));
  });

  archive = this.handle(async (req, res) => {
    sendSuccess(res, await this.exerciseService.archive(this.param(req, "id")));
  });
}

import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { CreateGrowthRecordInput, UpdateGrowthRecordInput } from "../models/growth-record.js";
import type { GrowthRecordService } from "../services/growth-record-service.js";

const FIELDS = ["measuredOn", "heightCm", "weightKg", "headCircumferenceCm", "notes"] as const;

function pick(body: Record<string, unknown>): UpdateGrowthRecordInput {
  const picked: Record<string, unknown> = {};
  for (const field of FIELDS) if (body[field] !== undefined) picked[field] = body[field];
  return picked as UpdateGrowthRecordInput;
}

export class GrowthRecordController extends BaseController {
  constructor(private growthRecordService: GrowthRecordService) {
    super();
  }

  list = this.handle(async (req, res) => {
    sendSuccess(res, await this.growthRecordService.list(this.userId(req), this.param(req, "childId")));
  });

  create = this.handle(async (req, res) => {
    const record = await this.growthRecordService.create(this.userId(req), this.param(req, "childId"), pick(req.body) as CreateGrowthRecordInput);
    sendSuccess(res, record, 201);
  });

  update = this.handle(async (req, res) => {
    sendSuccess(res, await this.growthRecordService.update(this.userId(req), this.param(req, "childId"), this.param(req, "id"), pick(req.body)));
  });

  delete = this.handle(async (req, res) => {
    await this.growthRecordService.delete(this.userId(req), this.param(req, "childId"), this.param(req, "id"));
    res.status(204).end();
  });

  report = this.handle(async (req, res) => {
    sendSuccess(res, await this.growthRecordService.report(this.userId(req), this.param(req, "childId")));
  });
}

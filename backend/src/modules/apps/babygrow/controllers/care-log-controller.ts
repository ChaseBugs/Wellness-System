import { BaseController } from "../../../../utils/base-controller.js";
import { toPageQuery } from "../../../../utils/pagination.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { CareLogType, CreateCareLogInput, UpdateCareLogInput } from "../models/care-log.js";
import type { CareLogService } from "../services/care-log-service.js";

const FIELDS = ["logType", "startedAt", "endedAt", "details", "notes"] as const;

function pick(body: Record<string, unknown>): CreateCareLogInput {
  const picked: Record<string, unknown> = {};
  for (const field of FIELDS) if (body[field] !== undefined) picked[field] = body[field];
  return picked as unknown as CreateCareLogInput;
}

export class CareLogController extends BaseController {
  constructor(private careLogService: CareLogService) {
    super();
  }

  list = this.handle(async (req, res) => {
    sendSuccess(
      res,
      await this.careLogService.list(this.userId(req), this.param(req, "childId"), {
        ...toPageQuery(req.query.page, req.query.limit, 50),
        logType: this.query(req, "type") as CareLogType | undefined,
        from: this.query(req, "from"),
        to: this.query(req, "to")
      })
    );
  });

  create = this.handle(async (req, res) => {
    sendSuccess(res, await this.careLogService.create(this.userId(req), this.param(req, "childId"), pick(req.body)), 201);
  });

  update = this.handle(async (req, res) => {
    const { logType: _ignored, ...input } = pick(req.body);
    sendSuccess(res, await this.careLogService.update(this.userId(req), this.param(req, "childId"), this.param(req, "id"), input as UpdateCareLogInput));
  });

  delete = this.handle(async (req, res) => {
    await this.careLogService.delete(this.userId(req), this.param(req, "childId"), this.param(req, "id"));
    res.status(204).end();
  });

  daySummary = this.handle(async (req, res) => {
    sendSuccess(
      res,
      await this.careLogService.daySummary(
        this.userId(req),
        this.param(req, "childId"),
        String(req.query.date),
        this.query(req, "timezone") ?? "UTC"
      )
    );
  });
}

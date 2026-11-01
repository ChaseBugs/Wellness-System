import { BaseController } from "../../../../utils/base-controller.js";
import { toPageQuery } from "../../../../utils/pagination.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { CompleteSessionInput } from "../models/session.js";
import type { SessionService } from "../services/session-service.js";

export class SessionController extends BaseController {
  constructor(private sessionService: SessionService) {
    super();
  }

  start = this.handle(async (req, res) => {
    const session = await this.sessionService.start(this.userId(req), this.appCode(req), String(req.body.routineId));
    sendSuccess(res, session, 201);
  });

  complete = this.handle(async (req, res) => {
    const body = req.body as CompleteSessionInput;
    const session = await this.sessionService.complete(this.userId(req), this.appCode(req), this.param(req, "id"), {
      completedSteps: body.completedSteps,
      durationSeconds: body.durationSeconds,
      perceivedEffort: body.perceivedEffort,
      notes: body.notes
    });
    sendSuccess(res, session);
  });

  abandon = this.handle(async (req, res) => {
    sendSuccess(res, await this.sessionService.abandon(this.userId(req), this.appCode(req), this.param(req, "id")));
  });

  list = this.handle(async (req, res) => {
    sendSuccess(res, await this.sessionService.list(this.userId(req), this.appCode(req), toPageQuery(req.query.page, req.query.limit)));
  });

  progress = this.handle(async (req, res) => {
    sendSuccess(res, await this.sessionService.progress(this.userId(req), this.appCode(req)));
  });
}

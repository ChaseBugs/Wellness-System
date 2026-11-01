import type { Request } from "express";
import type { ResourceActor } from "../../../../shared/resource-kit/resource-service.js";
import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { HeightAdminService } from "../services/height-admin-service.js";

export class HeightAdminController extends BaseController {
  constructor(private heightAdminService: HeightAdminService) {
    super();
  }

  stats = this.handle(async (_req, res) => {
    sendSuccess(res, await this.heightAdminService.stats());
  });

  createPlan = this.handle(async (req, res) => {
    sendSuccess(res, await this.heightAdminService.savePlan(undefined, req.body, this.actor(req)), 201);
  });

  updatePlan = this.handle(async (req, res) => {
    sendSuccess(res, await this.heightAdminService.savePlan(this.param(req, "id"), req.body, this.actor(req)));
  });

  private actor(req: Request): ResourceActor {
    return { id: this.userId(req), role: req.user!.role, requestId: req.id };
  }
}

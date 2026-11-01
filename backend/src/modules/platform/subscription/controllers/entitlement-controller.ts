import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { EntitlementService } from "../services/entitlement-service.js";

export class EntitlementController extends BaseController {
  constructor(private entitlementService: EntitlementService) {
    super();
  }

  summary = this.handle(async (req, res) => {
    sendSuccess(res, await this.entitlementService.summary(this.userId(req)));
  });

  eligibility = this.handle(async (req, res) => {
    sendSuccess(res, await this.entitlementService.eligibility(this.userId(req), String(req.query.planCode)));
  });
}

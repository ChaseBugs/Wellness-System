import type { AppCode } from "../../../../config/app-catalog.js";
import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { PlanService } from "../services/plan-service.js";

export class PlanController extends BaseController {
  constructor(private planService: PlanService) {
    super();
  }

  list = this.handle(async (req, res) => {
    sendSuccess(res, await this.planService.list(this.query(req, "app") as AppCode | undefined));
  });
}

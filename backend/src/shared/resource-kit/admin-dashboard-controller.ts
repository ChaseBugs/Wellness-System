import { BaseController } from "../../utils/base-controller.js";
import { sendSuccess } from "../../utils/response.js";
import type { AdminDashboardService } from "./admin-dashboard-service.js";

export class AdminDashboardController extends BaseController {
  constructor(private adminDashboardService: AdminDashboardService) {
    super();
  }

  summary = this.handle(async (_req, res) => {
    sendSuccess(res, await this.adminDashboardService.summary());
  });
}

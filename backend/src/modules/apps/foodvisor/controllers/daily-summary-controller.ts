import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { DailySummaryService } from "../services/daily-summary-service.js";

export class DailySummaryController extends BaseController {
  constructor(private dailySummaryService: DailySummaryService) {
    super();
  }

  get = this.handle(async (req, res) => {
    sendSuccess(
      res,
      await this.dailySummaryService.get(this.userId(req), String(req.query.date), this.query(req, "timezone") ?? "UTC")
    );
  });
}

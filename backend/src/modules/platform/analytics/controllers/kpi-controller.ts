import type { AppCode } from "../../../../config/app-catalog.js";
import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { KpiService } from "../services/kpi-service.js";

export class KpiController extends BaseController {
  constructor(private kpiService: KpiService) {
    super();
  }

  summary = this.handle(async (req, res) => {
    sendSuccess(
      res,
      await this.kpiService.summary({
        appCode: String(req.query.app) as AppCode,
        from: String(req.query.from),
        to: String(req.query.to)
      })
    );
  });
}

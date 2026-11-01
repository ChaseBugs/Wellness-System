import type { AppCode } from "../../../../config/app-catalog.js";
import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { AppService } from "../services/app-service.js";

export class AppController extends BaseController {
  constructor(private appService: AppService) {
    super();
  }

  listCatalog = this.handle(async (req, res) => {
    sendSuccess(res, await this.appService.listCatalog(req.user?.id));
  });

  recordOpen = this.handle(async (req, res) => {
    sendSuccess(res, await this.appService.recordOpen(this.userId(req), this.param(req, "appCode") as AppCode));
  });
}

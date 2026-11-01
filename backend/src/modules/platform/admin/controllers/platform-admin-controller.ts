import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { PlatformAdminService } from "../services/platform-admin-service.js";

export class PlatformAdminController extends BaseController {
  constructor(private platformAdminService: PlatformAdminService) {
    super();
  }

  overview = this.handle(async (_req, res) => {
    sendSuccess(res, await this.platformAdminService.overview());
  });

  updateAccount = this.handle(async (req, res) => {
    const actor = { id: this.userId(req), role: req.user!.role, requestId: req.id };
    sendSuccess(res, await this.platformAdminService.updateAccount(this.param(req, "id"), req.body, actor));
  });
}

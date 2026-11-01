import type { AppCode } from "../../../../config/app-catalog.js";
import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { DeliverySource, DeliveryStatus } from "../models/push.js";
import type { PushDispatchService } from "../services/push-dispatch-service.js";

export class PushController extends BaseController {
  constructor(private pushService: PushDispatchService) {
    super();
  }

  /** Runs the reminder job now (the scheduler runs the same job every tick). */
  dispatch = this.handle(async (_req, res) => {
    sendSuccess(res, await this.pushService.dispatchDueReminders(new Date()));
  });

  deliveries = this.handle(async (req, res) => {
    sendSuccess(
      res,
      await this.pushService.listDeliveries({
        appCode: this.query(req, "appCode") as AppCode | undefined,
        source: this.query(req, "source") as DeliverySource | undefined,
        status: this.query(req, "status") as DeliveryStatus | undefined,
        limit: Number(this.query(req, "limit") ?? 100)
      })
    );
  });
}

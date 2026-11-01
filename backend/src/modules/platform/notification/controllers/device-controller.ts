import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { DeviceService } from "../services/device-service.js";

export class DeviceController extends BaseController {
  constructor(private deviceService: DeviceService) {
    super();
  }

  register = this.handle(async (req, res) => {
    const device = await this.deviceService.register(this.userId(req), this.appCode(req), {
      platform: req.body.platform,
      pushToken: req.body.pushToken
    });
    sendSuccess(res, device, 201);
  });

  list = this.handle(async (req, res) => {
    sendSuccess(res, await this.deviceService.list(this.userId(req), this.appCode(req)));
  });

  unregister = this.handle(async (req, res) => {
    await this.deviceService.unregister(this.userId(req), this.param(req, "id"));
    res.status(204).end();
  });
}

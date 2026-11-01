import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { UpdateUserInput } from "../models/user.js";
import type { UserService } from "../services/user-service.js";

export class UserController extends BaseController {
  constructor(private userService: UserService) {
    super();
  }

  getMe = this.handle(async (req, res) => {
    sendSuccess(res, await this.userService.getMe(this.userId(req)));
  });

  updateMe = this.handle(async (req, res) => {
    sendSuccess(res, await this.userService.updateMe(this.userId(req), req.body as UpdateUserInput));
  });

  deleteMe = this.handle(async (req, res) => {
    await this.userService.deleteMe(this.userId(req));
    res.status(204).end();
  });

  listApps = this.handle(async (req, res) => {
    sendSuccess(res, await this.userService.listApps(this.userId(req)));
  });
}
